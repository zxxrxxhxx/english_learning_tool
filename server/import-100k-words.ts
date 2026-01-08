import { getDb } from "./db";
import { englishEntries } from "../drizzle/schema";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

/**
 * 批量导入十万英语单词
 * 数据来源：https://github.com/1eez/103976.git
 */
async function importWords() {
  console.log("开始导入十万英语单词...");

  // 获取数据库连接
  const db = await getDb();
  if (!db) {
    throw new Error("数据库连接失败");
  }

  // 读取CSV文件
  const csvPath = "/tmp/english-words-repo/EnWords.csv";
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  // 解析CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<{ word: string; translation: string }>;

  console.log(`CSV文件解析完成，共 ${records.length} 条记录`);

  // 批量插入，每次1000条
  const batchSize = 1000;
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    try {
      // 准备批量插入数据
      const entries = batch.map((record) => {
        // 清理数据
        const word = record.word?.trim() || "";
        const translation = record.translation?.trim() || "";

        // 跳过无效数据
        if (!word || !translation) {
          skipped++;
          return null;
        }

        return {
          englishText: word.toLowerCase(), // 英文原文
          chineseTranslation: translation, // 中文译文
          ipa: null, // CSV中没有音标数据
          syllables: null, // CSV中没有音节数据
          categoryId: 1, // 默认分类（需要先创建一个默认分类）
          queryCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }).filter(Boolean); // 过滤掉null值

      if (entries.length > 0) {
        // 批量插入，忽略重复项
        await db
          .insert(englishEntries)
          .values(entries as any)
          .onDuplicateKeyUpdate({
            set: {
              updatedAt: new Date(),
            },
          });

        imported += entries.length;
        console.log(`已导入 ${imported} / ${records.length} 条记录...`);
      }
    } catch (error) {
      console.error(`批量插入失败 (批次 ${i / batchSize + 1}):`, error);
      errors += batch.length;
    }
  }

  console.log("\n导入完成！");
  console.log(`成功导入: ${imported} 条`);
  console.log(`跳过无效: ${skipped} 条`);
  console.log(`导入失败: ${errors} 条`);
  console.log(`总计: ${records.length} 条`);

  process.exit(0);
}

// 执行导入
importWords().catch((error) => {
  console.error("导入失败:", error);
  process.exit(1);
});
