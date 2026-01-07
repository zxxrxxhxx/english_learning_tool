import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// 管理员权限中间件
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "需要管理员权限" });
  }
  return next({ ctx });
});

// 审核员权限中间件
const auditorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "auditor") {
    throw new TRPCError({ code: "FORBIDDEN", message: "需要审核员权限" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    // 用户注册（仅Manus OAuth用户，此处保留以便未来扩展）
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email().optional(),
          name: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 当前系统使用Manus OAuth，注册在首次登录时自动完成
        // 此API保留以便未来扩展自定义注册逻辑
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
        }
        return { success: true, message: "注册成功" };
      }),
  }),

  // ==================== 翻译查询相关 ====================
  translation: router({
    // 查询单词/短语
    search: publicProcedure
      .input(z.object({ text: z.string().max(50) }))
      .query(async ({ input, ctx }) => {
        const entry = await db.searchEnglishEntry(input.text.trim().toLowerCase());
        
        if (!entry) {
          // 记录未收录词
          await db.recordUnrecordedWord(input.text.trim());
          return { found: false, message: "该内容不在词库中，已记录需求，后续将补充" };
        }

        // 增加查询计数
        await db.incrementQueryCount(entry.id);

        // 如果用户已登录，记录查询历史
        if (ctx.user) {
          await db.createQueryHistory({
            userId: ctx.user.id,
            entryId: entry.id,
            queryTime: new Date(),
          });
        }

        // 获取谐音
        const homophones = await db.getHomophonesByEntryId(entry.id);

        // 获取分类信息
        const category = await db.getAllCategories();
        const categoryPath = getCategoryPath(category, entry.categoryId);

        return {
          found: true,
          entry,
          homophones,
          categoryPath,
        };
      }),

    // 按分类获取高频词
    getTopByCategory: publicProcedure
      .input(z.object({ categoryId: z.number(), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await db.getEntriesByCategoryId(input.categoryId, input.limit);
      }),
  }),

  // ==================== 分类相关 ====================
  category: router({
    // 获取所有分类（树状结构）
    getAll: publicProcedure.query(async () => {
      const categories = await db.getAllCategories();
      return buildCategoryTree(categories);
    }),

    // 获取子分类
    getChildren: publicProcedure
      .input(z.object({ parentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCategoriesByParentId(input.parentId);
      }),

    // 创建分类（管理员）
    create: adminProcedure
      .input(
        z.object({
          parentId: z.number(),
          name: z.string(),
          level: z.number().min(1).max(3),
          sortOrder: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createCategory(input);
      }),

    // 更新分类（管理员）
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          sortOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCategory(id, data);
        return { success: true };
      }),

    // 删除分类（管理员）
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCategory(input.id);
        return { success: true };
      }),
  }),

  // ==================== 用户历史记录 ====================
  history: router({
    // 获取用户历史记录
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ ctx, input }) => {
        const histories = await db.getUserQueryHistory(ctx.user.id, input.limit);
        
        // 获取关联的词条信息
        const entriesMap = new Map();
        for (const history of histories) {
          if (!entriesMap.has(history.entryId)) {
            const entry = await db.getEnglishEntryById(history.entryId);
            if (entry) entriesMap.set(history.entryId, entry);
          }
        }

        return histories.map(h => ({
          ...h,
          entry: entriesMap.get(h.entryId),
        }));
      }),

    // 删除单条历史记录
    delete: protectedProcedure
      .input(z.object({ historyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteUserQueryHistory(ctx.user.id, input.historyId);
        return { success: true };
      }),

    // 清空所有历史记录
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearUserQueryHistory(ctx.user.id);
      return { success: true };
    }),
  }),

  // ==================== 词库管理（管理员） ====================
  entry: router({
    // 获取词条列表
    list: adminProcedure
      .input(
        z.object({
          page: z.number().default(1),
          pageSize: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        // TODO: 实现分页逻辑
        return [];
      }),

    // 创建词条
    create: adminProcedure
      .input(
        z.object({
          englishText: z.string(),
          chineseTranslation: z.string(),
          ipa: z.string().optional(),
          syllables: z.string().optional(),
          categoryId: z.number(),
          homophoneText: z.string().optional(), // 谐音字段
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { homophoneText, ...entryData } = input;
        
        // 创建词条
        const entryId = await db.createEnglishEntry({
          ...entryData,
          queryCount: 0,
        });
        
        // 如果提供了谐音，自动创建并审核通过
        if (homophoneText && homophoneText.trim() && entryId) {
          const homophoneId = await db.createHomophone({
            entryId,
            homophoneText: homophoneText.trim(),
            auditStatus: 'approved', // 管理员添加的谐音直接通过
            submitterId: ctx.user.id,
            approvalCount: 1,
          });
          
          // 添加审核记录
          if (homophoneId) {
            await db.createAuditRecord({
              homophoneId,
              auditorId: ctx.user.id,
              action: 'approve',
              opinion: '管理员添加词条时直接创建',
            });
          }
        }
        
        return { success: true, entryId };
      }),

    // 更新词条
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          englishText: z.string().optional(),
          chineseTranslation: z.string().optional(),
          ipa: z.string().optional(),
          syllables: z.string().optional(),
          categoryId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateEnglishEntry(id, data);
        return { success: true };
      }),

    // 删除词条
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEnglishEntry(input.id);
        return { success: true };
      }),
  }),

  // ==================== 谐音管理 ====================
  homophone: router({
    // 获取待审核谐音列表（审核员）
    getPending: auditorProcedure.query(async () => {
      const homophones = await db.getPendingHomophones();
      
      // 获取关联的词条和提交者信息
      const result = [];
      for (const h of homophones) {
        const entry = await db.getEnglishEntryById(h.entryId);
        const submitter = await db.getUserById(h.submitterId);
        const auditRecords = await db.getAuditRecordsByHomophoneId(h.id);
        
        result.push({
          ...h,
          entry,
          submitter,
          auditRecords,
        });
      }
      
      return result;
    }),

    // 提交谐音（所有登录用户）
    create: protectedProcedure
      .input(
        z.object({
          entryId: z.number(),
          homophoneText: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // 获取审核时效配置（默认24小时）
        const config = await db.getSystemConfig("audit_deadline_hours");
        const deadlineHours = config ? parseInt(config.configValue) : 24;
        
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + deadlineHours);

        return await db.createHomophone({
          entryId: input.entryId,
          homophoneText: input.homophoneText,
          submitterId: ctx.user.id,
          auditStatus: "pending",
          approvalCount: 0,
          auditDeadline: deadline,
        });
      }),

    // 审核谐音（审核员）
    audit: auditorProcedure
      .input(
        z.object({
          homophoneId: z.number(),
          action: z.enum(["approve", "reject"]),
          opinion: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const homophone = await db.getHomophonesByEntryId(input.homophoneId);
        if (!homophone) {
          throw new TRPCError({ code: "NOT_FOUND", message: "谐音不存在" });
        }

        // 检查是否已审核过
        const existingRecords = await db.getAuditRecordsByHomophoneId(input.homophoneId);
        const alreadyAudited = existingRecords.some(r => r.auditorId === ctx.user.id);
        
        if (alreadyAudited) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "您已审核过此谐音" });
        }

        // 创建审核记录
        await db.createAuditRecord({
          homophoneId: input.homophoneId,
          auditorId: ctx.user.id,
          action: input.action,
          opinion: input.opinion || null,
        });

        // 更新谐音状态
        if (input.action === "reject") {
          // 任一拒绝则退回
          await db.updateHomophone(input.homophoneId, {
            auditStatus: "rejected",
            rejectionReason: input.opinion,
          });
        } else {
          // 检查是否达到通过条件（至少2名审核员通过）
          const approvalRecords = existingRecords.filter(r => r.action === "approve");
          const newApprovalCount = approvalRecords.length + 1;

          if (newApprovalCount >= 2) {
            await db.updateHomophone(input.homophoneId, {
              auditStatus: "approved",
              approvalCount: newApprovalCount,
            });
          } else {
            await db.updateHomophone(input.homophoneId, {
              approvalCount: newApprovalCount,
            });
          }
        }

        return { success: true };
      }),

    // 删除谐音（管理员）
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteHomophone(input.id);
        return { success: true };
      }),
  }),

  // ==================== 用户管理（管理员） ====================
  user: router({
    // 获取用户列表
    list: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    // 禁用/启用用户
    toggleDisabled: adminProcedure
      .input(z.object({ userId: z.number(), isDisabled: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.updateUserDisabledStatus(input.userId, input.isDisabled);
        return { success: true };
      }),
  }),

  // ==================== 数据统计 ====================
  stats: router({
    // 热词榜单
    topWords: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await db.getTopQueriedEntries(input.limit);
      }),

    // 未收录词列表（管理员）
    unrecordedWords: adminProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return await db.getUnrecordedWords(input.limit);
      }),

    // 删除未收录词（管理员）
    deleteUnrecordedWord: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteUnrecordedWord(input.id);
        return { success: true };
      }),
  }),

  // ==================== 系统配置（管理员） ====================
  config: router({
    // 获取配置
    get: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await db.getSystemConfig(input.key);
      }),

    // 设置配置
    set: adminProcedure
      .input(
        z.object({
          key: z.string(),
          value: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.setSystemConfig({
          configKey: input.key,
          configValue: input.value,
          description: input.description || null,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

// ==================== 辅助函数 ====================

// 构建分类树
function buildCategoryTree(categories: any[]) {
  const categoryMap = new Map();
  const tree: any[] = [];

  // 先创建所有节点
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // 构建树形结构
  categories.forEach(cat => {
    const node = categoryMap.get(cat.id);
    if (cat.parentId === 0) {
      tree.push(node);
    } else {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return tree;
}

// 获取分类路径
function getCategoryPath(categories: any[], categoryId: number): string {
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const path: string[] = [];
  
  let current = categoryMap.get(categoryId);
  while (current) {
    path.unshift(current.name);
    if (current.parentId === 0) break;
    current = categoryMap.get(current.parentId);
  }
  
  return path.join(" > ");
}
