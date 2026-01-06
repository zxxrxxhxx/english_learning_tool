import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("translation.search", () => {
  it("should return found result for existing entry", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translation.search({ text: "apple" });

    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.entry.englishText).toBe("apple");
      expect(result.entry.chineseTranslation).toContain("苹果");
    }
  });

  it("should return not found for non-existing entry", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translation.search({ text: "nonexistentword123" });

    expect(result.found).toBe(false);
    expect(result.message).toContain("不在词库中");
  });
});

describe("category.getAll", () => {
  it("should return category tree structure", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.category.getAll();

    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    
    // 检查是否有一级分类
    const hasTopLevel = categories.some((cat: any) => cat.name === "日常英语");
    expect(hasTopLevel).toBe(true);
  });
});

describe("auth.me", () => {
  it("should return null for unauthenticated user", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeNull();
  });

  it("should return user info for authenticated user", async () => {
    const testUser: AuthenticatedUser = {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx = createTestContext(testUser);
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).not.toBeNull();
    expect(user?.name).toBe("Test User");
    expect(user?.email).toBe("test@example.com");
  });
});
