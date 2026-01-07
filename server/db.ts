import { and, desc, eq, gte, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditRecords,
  auditorPermissions,
  categories,
  englishEntries,
  entryCategoryRelations,
  homophones,
  InsertAuditRecord,
  InsertAuditorPermission,
  InsertCategory,
  InsertEnglishEntry,
  InsertHomophone,
  InsertQueryHistory,
  InsertSystemConfig,
  InsertUnrecordedWord,
  InsertUser,
  queryHistory,
  systemConfigs,
  unrecordedWords,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== 用户相关 ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserDisabledStatus(userId: number, isDisabled: boolean) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ isDisabled: isDisabled ? 1 : 0 }).where(eq(users.id, userId));
}

export async function updateUser(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(users).where(eq(users.id, userId));
}

// ==================== 分类相关 ====================

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories).orderBy(categories.level, categories.sortOrder);
}

export async function getCategoriesByParentId(parentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, parentId))
    .orderBy(categories.sortOrder);
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(categories).values(category) as any;
  return Number(result.insertId);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) return;

  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(categories).where(eq(categories.id, id));
}

// ==================== 词库相关 ====================

export async function searchEnglishEntry(text: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(englishEntries)
    .where(eq(englishEntries.englishText, text))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getEnglishEntryById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(englishEntries).where(eq(englishEntries.id, id)).limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getEntriesByCategoryId(categoryId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(englishEntries)
    .where(eq(englishEntries.categoryId, categoryId))
    .orderBy(desc(englishEntries.queryCount))
    .limit(limit);
}

export async function createEnglishEntry(entry: InsertEnglishEntry) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(englishEntries).values(entry);
  // MySQL driver returns insertId in different formats
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  return insertId ? Number(insertId) : null;
}

export async function updateEnglishEntry(id: number, data: Partial<InsertEnglishEntry>) {
  const db = await getDb();
  if (!db) return;

  await db.update(englishEntries).set(data).where(eq(englishEntries.id, id));
}

export async function deleteEnglishEntry(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(englishEntries).where(eq(englishEntries.id, id));
}

export async function incrementQueryCount(entryId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(englishEntries)
    .set({ queryCount: sql`${englishEntries.queryCount} + 1` })
    .where(eq(englishEntries.id, entryId));
}

export async function getTopQueriedEntries(limit = 50, days?: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(englishEntries)
    .orderBy(desc(englishEntries.queryCount))
    .limit(limit);
}

// ==================== 谐音相关 ====================

export async function getHomophonesByEntryId(entryId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(homophones)
    .where(and(eq(homophones.entryId, entryId), eq(homophones.auditStatus, "approved")));
}

export async function getPendingHomophones() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(homophones)
    .where(eq(homophones.auditStatus, "pending"))
    .orderBy(homophones.createdAt);
}

export async function createHomophone(homophone: InsertHomophone) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(homophones).values(homophone) as any;
  return Number(result.insertId);
}

export async function updateHomophone(id: number, data: Partial<InsertHomophone>) {
  const db = await getDb();
  if (!db) return;

  await db.update(homophones).set(data).where(eq(homophones.id, id));
}

export async function deleteHomophone(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(homophones).where(eq(homophones.id, id));
}

// ==================== 审核记录相关 ====================

export async function createAuditRecord(record: InsertAuditRecord) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(auditRecords).values(record) as any;
  return Number(result.insertId);
}

export async function getAuditRecordsByHomophoneId(homophoneId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(auditRecords).where(eq(auditRecords.homophoneId, homophoneId));
}

// ==================== 查询历史相关 ====================

export async function createQueryHistory(history: InsertQueryHistory) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(queryHistory).values(history) as any;
  return Number(result.insertId);
}

export async function getUserQueryHistory(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(queryHistory)
    .where(eq(queryHistory.userId, userId))
    .orderBy(desc(queryHistory.queryTime))
    .limit(limit);
}

export async function deleteUserQueryHistory(userId: number, historyId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(queryHistory)
    .where(and(eq(queryHistory.userId, userId), eq(queryHistory.id, historyId)));
}

export async function clearUserQueryHistory(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(queryHistory).where(eq(queryHistory.userId, userId));
}

export async function deleteOldQueryHistory(monthsAgo: number) {
  const db = await getDb();
  if (!db) return;

  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo);

  await db.delete(queryHistory).where(sql`${queryHistory.queryTime} < ${cutoffDate}`);
}

// ==================== 未收录词相关 ====================

export async function recordUnrecordedWord(word: string) {
  const db = await getDb();
  if (!db) return;

  const existing = await db
    .select()
    .from(unrecordedWords)
    .where(eq(unrecordedWords.word, word))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(unrecordedWords)
      .set({ requestCount: sql`${unrecordedWords.requestCount} + 1` })
      .where(eq(unrecordedWords.word, word));
  } else {
    await db.insert(unrecordedWords).values({ word, requestCount: 1 });
  }
}

export async function getUnrecordedWords(limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(unrecordedWords)
    .orderBy(desc(unrecordedWords.requestCount))
    .limit(limit);
}

export async function deleteUnrecordedWord(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(unrecordedWords).where(eq(unrecordedWords.id, id));
}

// ==================== 审核员权限相关 ====================

export async function createAuditorPermission(permission: InsertAuditorPermission) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(auditorPermissions).values(permission) as any;
  return Number(result.insertId);
}

export async function getAuditorPermissions(auditorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(auditorPermissions)
    .where(eq(auditorPermissions.auditorId, auditorId));
}

export async function deleteAuditorPermission(auditorId: number, categoryId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(auditorPermissions)
    .where(
      and(
        eq(auditorPermissions.auditorId, auditorId),
        eq(auditorPermissions.categoryId, categoryId)
      )
    );
}

// ==================== 系统配置相关 ====================

export async function getSystemConfig(key: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(systemConfigs)
    .where(eq(systemConfigs.configKey, key))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function setSystemConfig(config: InsertSystemConfig) {
  const db = await getDb();
  if (!db) return;

  await db
    .insert(systemConfigs)
    .values(config)
    .onDuplicateKeyUpdate({
      set: { configValue: config.configValue },
    });
}
