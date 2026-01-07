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
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("user.create", () => {
  it("should create a new user with valid data", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueId = `test_user_${Date.now()}`;
    const result = await caller.user.create({
      openId: uniqueId,
      name: "Test User",
      email: "test@example.com",
      role: "user",
    });

    expect(result).toEqual({ success: true, message: "用户创建成功" });
  });

  it("should create an admin user", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueId = `test_admin_${Date.now()}`;
    const result = await caller.user.create({
      openId: uniqueId,
      name: "Test Admin",
      email: "admin@test.com",
      role: "admin",
    });

    expect(result).toEqual({ success: true, message: "用户创建成功" });
  });

  it("should create user without email", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueId = `test_no_email_${Date.now()}`;
    const result = await caller.user.create({
      openId: uniqueId,
      name: "No Email User",
      role: "user",
    });

    expect(result).toEqual({ success: true, message: "用户创建成功" });
  });

  it("should reject duplicate openId", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueId = `test_duplicate_${Date.now()}`;
    
    // 第一次创建应该成功
    await caller.user.create({
      openId: uniqueId,
      name: "First User",
      role: "user",
    });

    // 第二次创建相同openId应该失败
    await expect(
      caller.user.create({
        openId: uniqueId,
        name: "Second User",
        role: "user",
      })
    ).rejects.toThrow("用户ID已存在");
  });
});
