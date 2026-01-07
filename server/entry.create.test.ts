import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
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
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("entry.create", () => {
  it("should create entry without homophone", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.entry.create({
      englishText: "test",
      chineseTranslation: "测试",
      ipa: "/test/",
      syllables: "test",
      categoryId: 1,
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("entryId");
    expect(typeof result.entryId).toBe("number");
  });

  it("should create entry with homophone", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.entry.create({
      englishText: "apple",
      chineseTranslation: "苹果",
      ipa: "/ˈæpl/",
      syllables: "ap·ple",
      categoryId: 1,
      homophoneText: "阿婆",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("entryId");
    expect(typeof result.entryId).toBe("number");
  });

  it("should handle empty homophone text", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.entry.create({
      englishText: "banana",
      chineseTranslation: "香蕉",
      categoryId: 1,
      homophoneText: "",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("entryId");
  });
});
