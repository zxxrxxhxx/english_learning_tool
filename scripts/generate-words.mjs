import { invokeLLM } from "../server/_core/llm.ts";
import fs from "fs";

console.log("开始生成1000个常用英语单词数据...");

const prompt = `请生成100个最常用的英语单词，每个单词包含以下信息：
1. 英文原文
2. 中文译文
3. 国际音标（IPA格式）
4. 音节划分（用-分隔）
5. 中文发音谐音（用中文字表示发音，要准确且易记）

请以JSON数组格式输出，每个单词是一个对象，包含以下字段：
- english: 英文单词
- chinese: 中文译文
- ipa: 国际音标
- syllables: 音节划分
- homophone: 中文谐音

示例格式：
[
  {
    "english": "hello",
    "chinese": "你好；问候",
    "ipa": "/həˈləʊ/",
    "syllables": "hel-lo",
    "homophone": "哈喽"
  }
]

要求：
1. 选择最常用的基础词汇（如：time, people, way, day, man, thing等）
2. 谐音要准确反映英文发音，便于中国人记忆
3. 确保是有效的JSON格式
4. 只返回JSON数组，不要其他说明文字`;

try {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: "你是一个专业的英语教学助手，擅长创建易于记忆的学习材料。" },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "word_list",
        strict: true,
        schema: {
          type: "object",
          properties: {
            words: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  english: { type: "string" },
                  chinese: { type: "string" },
                  ipa: { type: "string" },
                  syllables: { type: "string" },
                  homophone: { type: "string" },
                },
                required: ["english", "chinese", "ipa", "syllables", "homophone"],
                additionalProperties: false,
              },
            },
          },
          required: ["words"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  const data = JSON.parse(content);
  
  console.log(`成功生成 ${data.words.length} 个单词`);
  
  // 保存到文件
  fs.writeFileSync(
    "/home/ubuntu/english_learning_tool/scripts/words-batch-1.json",
    JSON.stringify(data.words, null, 2)
  );
  
  console.log("数据已保存到 words-batch-1.json");
  console.log("前3个单词示例：");
  console.log(JSON.stringify(data.words.slice(0, 3), null, 2));
  
} catch (error) {
  console.error("生成失败：", error);
  process.exit(1);
}
