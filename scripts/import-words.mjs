import { getDb } from "../server/db.ts";
import { englishEntries, homophones } from "../drizzle/schema.ts";
import fs from "fs";

console.log("开始导入单词数据...");

try {
  // 读取生成的单词数据
  const wordsData = JSON.parse(
    fs.readFileSync("/home/ubuntu/english_learning_tool/scripts/words-batch-1.json", "utf-8")
  );

  console.log(`读取到 ${wordsData.length} 个单词`);

  const db = await getDb();
  if (!db) {
    throw new Error("无法连接到数据库");
  }

  let successCount = 0;
  let errorCount = 0;

  // 使用分类ID 1（假设已存在）
  const categoryId = 1;

  for (const word of wordsData) {
    try {
      // 插入词条
      const result = await db.insert(englishEntries).values({
        englishText: word.english,
        chineseTranslation: word.chinese,
        ipa: word.ipa,
        syllables: word.syllables,
        categoryId: categoryId,
        queryCount: 0,
      });

      const entryId = Number(result[0].insertId);

      // 插入谐音（自动审核通过）
      if (word.homophone && entryId) {
        await db.insert(homophones).values({
          entryId: entryId,
          homophoneText: word.homophone,
          auditStatus: "approved",
          submitterId: 1, // 系统用户
          approvalCount: 1,
        });
      }

      successCount++;
      if (successCount % 10 === 0) {
        console.log(`已导入 ${successCount} 个单词...`);
      }
    } catch (error) {
      errorCount++;
      console.error(`导入失败 (${word.english}):`, error.message);
    }
  }

  console.log("\n导入完成！");
  console.log(`成功: ${successCount} 个`);
  console.log(`失败: ${errorCount} 个`);
  
} catch (error) {
  console.error("导入过程出错：", error);
  process.exit(1);
}
