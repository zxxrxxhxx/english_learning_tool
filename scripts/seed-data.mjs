import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function seedData() {
  console.log("开始初始化数据...");

  try {
    const connection = await mysql.createConnection(DATABASE_URL);

    // 插入一级分类
    console.log("插入一级分类...");
    await connection.execute(
      `INSERT INTO categories (parentId, name, level, sortOrder) VALUES 
      (0, '日常英语', 1, 1),
      (0, '工作英语', 1, 2),
      (0, '考试英语', 1, 3),
      (0, '兴趣英语', 1, 4),
      (0, '行业英语', 1, 5)
      ON DUPLICATE KEY UPDATE name=name`
    );

    // 获取一级分类ID
    const [categories] = await connection.execute(
      "SELECT id, name FROM categories WHERE level = 1"
    );

    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    // 插入二级分类
    console.log("插入二级分类...");
    await connection.execute(
      `INSERT INTO categories (parentId, name, level, sortOrder) VALUES 
      (${categoryMap["日常英语"]}, '购物', 2, 1),
      (${categoryMap["日常英语"]}, '旅行', 2, 2),
      (${categoryMap["日常英语"]}, '饮食', 2, 3),
      (${categoryMap["日常英语"]}, '社交', 2, 4),
      (${categoryMap["工作英语"]}, '会议', 2, 1),
      (${categoryMap["工作英语"]}, '邮件', 2, 2),
      (${categoryMap["考试英语"]}, '四级词汇', 2, 1),
      (${categoryMap["考试英语"]}, '六级词汇', 2, 2),
      (${categoryMap["考试英语"]}, '雅思词汇', 2, 3)
      ON DUPLICATE KEY UPDATE name=name`
    );

    // 获取二级分类ID
    const [subCategories] = await connection.execute(
      "SELECT id, name FROM categories WHERE level = 2"
    );

    const subCategoryMap = {};
    subCategories.forEach((cat) => {
      subCategoryMap[cat.name] = cat.id;
    });

    // 插入三级分类
    console.log("插入三级分类...");
    await connection.execute(
      `INSERT INTO categories (parentId, name, level, sortOrder) VALUES 
      (${subCategoryMap["饮食"]}, '水果', 3, 1),
      (${subCategoryMap["饮食"]}, '蔬菜', 3, 2),
      (${subCategoryMap["饮食"]}, '餐厅用语', 3, 3),
      (${subCategoryMap["购物"]}, '询价', 3, 1),
      (${subCategoryMap["购物"]}, '付款', 3, 2),
      (${subCategoryMap["旅行"]}, '交通', 3, 1),
      (${subCategoryMap["旅行"]}, '住宿', 3, 2)
      ON DUPLICATE KEY UPDATE name=name`
    );

    // 获取三级分类ID
    const [thirdCategories] = await connection.execute(
      "SELECT id, name FROM categories WHERE level = 3"
    );

    const thirdCategoryMap = {};
    thirdCategories.forEach((cat) => {
      thirdCategoryMap[cat.name] = cat.id;
    });

    // 插入示例词条
    console.log("插入示例词条...");
    const sampleEntries = [
      {
        english: "apple",
        chinese: "苹果（一种常见水果，圆形，多为红色或绿色）",
        ipa: "/ˈæpl/",
        syllables: "ap·ple",
        category: thirdCategoryMap["水果"],
      },
      {
        english: "banana",
        chinese: "香蕉（一种热带水果，黄色，长条形）",
        ipa: "/bəˈnɑːnə/",
        syllables: "ba·na·na",
        category: thirdCategoryMap["水果"],
      },
      {
        english: "hello",
        chinese: "你好（用于打招呼或问候）",
        ipa: "/həˈləʊ/",
        syllables: "hel·lo",
        category: thirdCategoryMap["餐厅用语"],
      },
      {
        english: "thank you",
        chinese: "谢谢（表达感谢的常用语）",
        ipa: "/θæŋk juː/",
        syllables: "thank you",
        category: thirdCategoryMap["餐厅用语"],
      },
      {
        english: "how much",
        chinese: "多少钱（询问价格的常用短语）",
        ipa: "/haʊ mʌtʃ/",
        syllables: "how much",
        category: thirdCategoryMap["询价"],
      },
    ];

    for (const entry of sampleEntries) {
      await connection.execute(
        `INSERT INTO english_entries (englishText, chineseTranslation, ipa, syllables, categoryId, queryCount) 
         VALUES (?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE chineseTranslation=VALUES(chineseTranslation)`,
        [entry.english, entry.chinese, entry.ipa, entry.syllables, entry.category]
      );
    }

    // 设置系统配置
    console.log("设置系统配置...");
    await connection.execute(
      `INSERT INTO system_configs (configKey, configValue, description) VALUES 
      ('audit_deadline_hours', '24', '谐音审核截止时间（小时）')
      ON DUPLICATE KEY UPDATE configValue=VALUES(configValue)`
    );

    await connection.end();
    console.log("数据初始化完成！");
  } catch (error) {
    console.error("数据初始化失败:", error);
    process.exit(1);
  }
}

seedData();
