import { eq, like, or, sql } from "drizzle-orm";
import { englishEntries } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * 分页查询词条
 */
export async function getEnglishEntriesWithPagination(params: {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: number;
}) {
  const db = await getDb();
  if (!db) {
    return { data: [], total: 0 };
  }

  const { page, pageSize, search, categoryId } = params;
  const offset = (page - 1) * pageSize;

  // 构建查询条件
  const conditions = [];
  
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        like(englishEntries.englishText, searchTerm),
        like(englishEntries.chineseTranslation, searchTerm)
      )
    );
  }
  
  if (categoryId !== undefined) {
    conditions.push(eq(englishEntries.categoryId, categoryId));
  }

  // 查询总数
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(englishEntries);
    
  if (conditions.length > 0) {
    conditions.forEach(condition => {
      if (condition) {
        countQuery.where(condition);
      }
    });
  }
  
  const countResult = await countQuery;
  const total = Number(countResult[0]?.count || 0);

  // 查询数据
  let dataQuery = db
    .select()
    .from(englishEntries)
    .limit(pageSize)
    .offset(offset)
    .orderBy(englishEntries.id);
    
  if (conditions.length > 0) {
    conditions.forEach(condition => {
      if (condition) {
        dataQuery = dataQuery.where(condition) as any;
      }
    });
  }
  
  const data = await dataQuery;

  return {
    data,
    total,
  };
}
