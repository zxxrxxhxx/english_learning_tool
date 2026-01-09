/**
 * AI个性化学习建议服务
 * 基于用户查询历史生成学习推荐
 */

import { invokeLLM } from "./_core/llm";
import * as db from "./db";

interface LearningInsight {
  totalWords: number;
  recentWords: number;
  topCategories: string[];
  learningPattern: string;
  suggestions: string[];
}

/**
 * 分析用户学习行为并生成个性化建议
 */
export async function generateLearningAdvice(userId: number): Promise<LearningInsight> {
  // 获取用户查询历史
  const histories = await db.getUserQueryHistory(userId, 100);
  
  if (!histories || histories.length === 0) {
    return {
      totalWords: 0,
      recentWords: 0,
      topCategories: [],
      learningPattern: "暂无学习数据",
      suggestions: ["开始查询单词，系统将为您生成个性化学习建议"],
    };
  }

  // 统计数据
  const totalWords = histories.length;
  const recentWords = histories.filter((h: any) => {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 7);
    return new Date(h.queryTime) > dayAgo;
  }).length;

  // 提取单词列表
  const words = histories
    .map((h: any) => h.entry?.englishText)
    .filter(Boolean)
    .slice(0, 50); // 最近50个单词

  // 提取分类信息
  const categories = histories
    .map((h: any) => h.entry?.categoryId)
    .filter(Boolean);
  
  const categoryMap = new Map<number, number>();
  categories.forEach((catId: number) => {
    categoryMap.set(catId, (categoryMap.get(catId) || 0) + 1);
  });

  // 获取分类名称
  const allCategories = await db.getAllCategories();
  const topCategoryIds = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);
  
  const topCategories = topCategoryIds
    .map(id => allCategories.find((c: any) => c.id === id)?.name)
    .filter(Boolean) as string[];

  // 调用LLM分析学习模式并生成建议
  const prompt = `你是一位专业的英语学习顾问。请分析用户的学习数据并给出个性化建议。

**用户学习数据：**
- 总查询单词数：${totalWords}
- 最近7天查询：${recentWords}个
- 最近查询的单词：${words.slice(0, 20).join(", ")}
- 主要学习领域：${topCategories.join("、") || "未分类"}

**请提供：**
1. 学习模式分析（1-2句话，描述用户的学习特点和偏好）
2. 3-5条具体的学习建议（每条建议要具体、可执行）

**输出格式（JSON）：**
{
  "learningPattern": "学习模式分析",
  "suggestions": ["建议1", "建议2", "建议3"]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "你是一位专业的英语学习顾问，擅长分析学习数据并提供个性化建议。" },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "learning_advice",
          strict: true,
          schema: {
            type: "object",
            properties: {
              learningPattern: { type: "string", description: "学习模式分析" },
              suggestions: {
                type: "array",
                items: { type: "string" },
                description: "学习建议列表",
              },
            },
            required: ["learningPattern", "suggestions"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("LLM返回内容为空或格式错误");
    }

    const aiAdvice = JSON.parse(content);

    return {
      totalWords,
      recentWords,
      topCategories,
      learningPattern: aiAdvice.learningPattern,
      suggestions: aiAdvice.suggestions,
    };
  } catch (error) {
    console.error("AI学习建议生成失败:", error);
    
    // 降级到规则引擎
    return {
      totalWords,
      recentWords,
      topCategories,
      learningPattern: recentWords > 20 
        ? "您最近学习非常积极，保持这个节奏！" 
        : "建议增加学习频率，每天查询5-10个新单词。",
      suggestions: [
        `您已经查询了${totalWords}个单词，继续保持学习热情！`,
        topCategories.length > 0 
          ? `您主要学习${topCategories[0]}相关词汇，可以尝试其他领域扩展词汇量。`
          : "建议从日常生活、商务、旅游等场景分类开始系统学习。",
        "使用谐音记忆法可以帮助您更快记住单词。",
        "定期复习已查询的单词，巩固记忆效果。",
      ],
    };
  }
}

/**
 * 推荐下一个应该学习的单词
 */
export async function recommendNextWords(userId: number, limit: number = 5): Promise<any[]> {
  // 获取用户查询历史
  const histories = await db.getUserQueryHistory(userId, 100);
  const queriedWordIds = histories.map((h: any) => h.entryId);

  // 获取用户主要学习的分类
  const categories = histories
    .map((h: any) => h.entry?.categoryId)
    .filter(Boolean);
  
  const categoryMap = new Map<number, number>();
  categories.forEach((catId: number) => {
    categoryMap.set(catId, (categoryMap.get(catId) || 0) + 1);
  });

  const topCategoryId = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  if (!topCategoryId) {
    // 没有历史记录，推荐热门词汇
    return await db.getEntriesByCategoryId(1, limit); // 默认分类
  }

  // 推荐同分类下未查询过的高频词汇
  const candidates = await db.getEntriesByCategoryId(topCategoryId, 50);
  const recommendations = candidates
    .filter((entry: any) => !queriedWordIds.includes(entry.id))
    .slice(0, limit);

  return recommendations;
}
