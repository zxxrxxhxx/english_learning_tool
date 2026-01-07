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

describe("user management", () => {
  it("should update user information", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // 先创建一个用户
    const uniqueId = `test_update_${Date.now()}`;
    await caller.user.create({
      openId: uniqueId,
      name: "Original Name",
      email: "original@example.com",
      role: "user",
    });

    // 获取用户ID
    const users = await caller.user.list();
    const createdUser = users.find((u: any) => u.openId === uniqueId);
    expect(createdUser).toBeDefined();

    // 更新用户信息
    const result = await caller.user.update({
      userId: createdUser!.id,
      name: "Updated Name",
      email: "updated@example.com",
      role: "admin",
    });

    expect(result).toEqual({ success: true, message: "用户信息已更新" });

    // 验证更新后的信息
    const updatedUsers = await caller.user.list();
    const updatedUser = updatedUsers.find((u: any) => u.openId === uniqueId);
    expect(updatedUser?.name).toBe("Updated Name");
    expect(updatedUser?.email).toBe("updated@example.com");
    expect(updatedUser?.role).toBe("admin");
  });

  it("should update user password", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // 创建用户
    const uniqueId = `test_password_${Date.now()}`;
    await caller.user.create({
      openId: uniqueId,
      name: "Password Test User",
      role: "user",
    });

    const users = await caller.user.list();
    const createdUser = users.find((u: any) => u.openId === uniqueId);

    // 设置密码
    const result = await caller.user.update({
      userId: createdUser!.id,
      password: "newpassword123",
    });

    expect(result).toEqual({ success: true, message: "用户信息已更新" });

    // 验证密码已设置
    const updatedUsers = await caller.user.list();
    const updatedUser = updatedUsers.find((u: any) => u.openId === uniqueId);
    expect(updatedUser?.passwordHash).toBeTruthy();
  });

  it("should delete user", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // 创建用户
    const uniqueId = `test_delete_${Date.now()}`;
    await caller.user.create({
      openId: uniqueId,
      name: "Delete Test User",
      role: "user",
    });

    const users = await caller.user.list();
    const createdUser = users.find((u: any) => u.openId === uniqueId);
    expect(createdUser).toBeDefined();

    // 删除用户
    const result = await caller.user.delete({
      userId: createdUser!.id,
    });

    expect(result).toEqual({ success: true, message: "用户已删除" });

    // 验证用户已删除
    const remainingUsers = await caller.user.list();
    const deletedUser = remainingUsers.find((u: any) => u.openId === uniqueId);
    expect(deletedUser).toBeUndefined();
  });

  it("should create user with password", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueId = `test_with_password_${Date.now()}`;
    const result = await caller.user.create({
      openId: uniqueId,
      name: "User With Password",
      email: "password@example.com",
      password: "securepass123",
      role: "user",
    });

    expect(result).toEqual({ success: true, message: "用户创建成功" });

    // 验证密码已加密存储
    const users = await caller.user.list();
    const createdUser = users.find((u: any) => u.openId === uniqueId);
    expect(createdUser?.passwordHash).toBeTruthy();
    expect(createdUser?.passwordHash).not.toBe("securepass123"); // 确保已加密
  });
});
