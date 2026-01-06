import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index, tinyint } from "drizzle-orm/mysql-core";

/**
 * 用户表 - 核心认证表
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }), // BCrypt加密密码
  role: mysqlEnum("role", ["user", "admin", "auditor"]).default("user").notNull(),
  isDisabled: tinyint("isDisabled").default(0).notNull(), // 0=正常 1=禁用
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * 分类表 - 三级分类体系
 * parent_id = 0 表示一级分类
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId").default(0).notNull(), // 0为一级分类
  name: varchar("name", { length: 100 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(), // 排序权重
  level: tinyint("level").notNull(), // 1=一级 2=二级 3=三级
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  parentIdIdx: index("parent_id_idx").on(table.parentId),
  levelIdx: index("level_idx").on(table.level),
}));

/**
 * 词库表 - 核心英语条目
 */
export const englishEntries = mysqlTable("english_entries", {
  id: int("id").autoincrement().primaryKey(),
  englishText: varchar("englishText", { length: 500 }).notNull(), // 英文原文
  chineseTranslation: text("chineseTranslation").notNull(), // 中文译文
  ipa: varchar("ipa", { length: 200 }), // 国际音标
  syllables: varchar("syllables", { length: 200 }), // 音节划分
  categoryId: int("categoryId").notNull(), // 主分类ID（三级细类）
  queryCount: int("queryCount").default(0).notNull(), // 查询次数统计
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  englishTextIdx: index("english_text_idx").on(table.englishText),
  categoryIdIdx: index("category_id_idx").on(table.categoryId),
  queryCountIdx: index("query_count_idx").on(table.queryCount),
}));

/**
 * 词库-分类关联表 - 支持多标签绑定
 */
export const entryCategoryRelations = mysqlTable("entry_category_relations", {
  id: int("id").autoincrement().primaryKey(),
  entryId: int("entryId").notNull(),
  categoryId: int("categoryId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  entryIdIdx: index("entry_id_idx").on(table.entryId),
  categoryIdIdx: index("category_id_idx").on(table.categoryId),
}));

/**
 * 谐音表 - 人工审核谐音记忆
 */
export const homophones = mysqlTable("homophones", {
  id: int("id").autoincrement().primaryKey(),
  entryId: int("entryId").notNull(), // 关联词库ID
  homophoneText: varchar("homophoneText", { length: 500 }).notNull(), // 谐音内容
  auditStatus: mysqlEnum("auditStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  submitterId: int("submitterId").notNull(), // 录入者ID
  auditOpinion: text("auditOpinion"), // 审核意见
  approvalCount: int("approvalCount").default(0).notNull(), // 通过审核数
  rejectionReason: text("rejectionReason"), // 拒绝原因
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  auditDeadline: timestamp("auditDeadline"), // 审核截止时间
}, (table) => ({
  entryIdIdx: index("entry_id_idx").on(table.entryId),
  auditStatusIdx: index("audit_status_idx").on(table.auditStatus),
  submitterIdIdx: index("submitter_id_idx").on(table.submitterId),
}));

/**
 * 审核记录表 - 记录每个审核员的审核操作
 */
export const auditRecords = mysqlTable("audit_records", {
  id: int("id").autoincrement().primaryKey(),
  homophoneId: int("homophoneId").notNull(),
  auditorId: int("auditorId").notNull(), // 审核员ID
  action: mysqlEnum("action", ["approve", "reject"]).notNull(),
  opinion: text("opinion"), // 审核意见
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  homophoneIdIdx: index("homophone_id_idx").on(table.homophoneId),
  auditorIdIdx: index("auditor_id_idx").on(table.auditorId),
}));

/**
 * 查询历史表 - 用户查询记录
 */
export const queryHistory = mysqlTable("query_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entryId: int("entryId").notNull(),
  queryTime: timestamp("queryTime").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  entryIdIdx: index("entry_id_idx").on(table.entryId),
  queryTimeIdx: index("query_time_idx").on(table.queryTime),
}));

/**
 * 未收录词表 - 记录用户查询但词库中不存在的词
 */
export const unrecordedWords = mysqlTable("unrecorded_words", {
  id: int("id").autoincrement().primaryKey(),
  word: varchar("word", { length: 500 }).notNull(),
  requestCount: int("requestCount").default(1).notNull(), // 请求次数
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  wordIdx: index("word_idx").on(table.word),
  requestCountIdx: index("request_count_idx").on(table.requestCount),
}));

/**
 * 审核员权限配置表 - 配置审核员可审核的分类范围
 */
export const auditorPermissions = mysqlTable("auditor_permissions", {
  id: int("id").autoincrement().primaryKey(),
  auditorId: int("auditorId").notNull(),
  categoryId: int("categoryId").notNull(), // 可审核的分类ID（0表示全部）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  auditorIdIdx: index("auditor_id_idx").on(table.auditorId),
}));

/**
 * 系统配置表 - 存储系统级配置
 */
export const systemConfigs = mysqlTable("system_configs", {
  id: int("id").autoincrement().primaryKey(),
  configKey: varchar("configKey", { length: 100 }).notNull().unique(),
  configValue: text("configValue").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// 类型导出
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type EnglishEntry = typeof englishEntries.$inferSelect;
export type InsertEnglishEntry = typeof englishEntries.$inferInsert;

export type Homophone = typeof homophones.$inferSelect;
export type InsertHomophone = typeof homophones.$inferInsert;

export type AuditRecord = typeof auditRecords.$inferSelect;
export type InsertAuditRecord = typeof auditRecords.$inferInsert;

export type QueryHistory = typeof queryHistory.$inferSelect;
export type InsertQueryHistory = typeof queryHistory.$inferInsert;

export type UnrecordedWord = typeof unrecordedWords.$inferSelect;
export type InsertUnrecordedWord = typeof unrecordedWords.$inferInsert;

export type AuditorPermission = typeof auditorPermissions.$inferSelect;
export type InsertAuditorPermission = typeof auditorPermissions.$inferInsert;

export type SystemConfig = typeof systemConfigs.$inferSelect;
export type InsertSystemConfig = typeof systemConfigs.$inferInsert;
