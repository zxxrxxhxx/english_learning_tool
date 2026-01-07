import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AdminUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AdminUser = {
    id: 1,
    openId: "admin-test",
    email: "admin@test.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("entry.management", () => {
  it("should list entries with pagination", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.entry.list({
      page: 1,
      pageSize: 10,
    });

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("page");
    expect(result).toHaveProperty("pageSize");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should search entries by keyword", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.entry.list({
      page: 1,
      pageSize: 10,
      search: "hello",
    });

    expect(result).toHaveProperty("data");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should create, update and delete entry", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create
    const created = await caller.entry.create({
      englishText: "test",
      chineseTranslation: "测试",
      ipa: "/test/",
      syllables: "test",
      categoryId: 1,
      homophoneText: "特斯特",
    });

    expect(created).toHaveProperty("entryId");
    expect(created.success).toBe(true);
    expect(typeof created.entryId).toBe("number");
    
    const entryId = created.entryId;

    // Update
    const updated = await caller.entry.update({
      id: entryId,
      englishText: "test-updated",
      chineseTranslation: "测试更新",
      ipa: "/test-updated/",
      syllables: "test-up-da-ted",
      categoryId: 1,
      homophoneText: "特斯特更新",
    });

    expect(updated.success).toBe(true);

    // Delete
    const deleted = await caller.entry.delete({
      id: entryId,
    });

    expect(deleted.success).toBe(true);
  });
});
