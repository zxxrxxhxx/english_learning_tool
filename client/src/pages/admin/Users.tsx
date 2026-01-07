import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { UserPlus, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

type UserFormData = {
  openId: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
};

type EditUserFormData = {
  userId: number;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "auditor";
};

export default function AdminUsers() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.user.list.useQuery();
  
  // 创建用户对话框
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<UserFormData>({
    openId: "",
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // 编辑用户对话框
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EditUserFormData | null>(null);

  // 删除用户对话框
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const toggleDisabledMutation = trpc.user.toggleDisabled.useMutation({
    onSuccess: () => {
      toast.success("操作成功");
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error("操作失败：" + error.message);
    },
  });

  const createUserMutation = trpc.user.create.useMutation({
    onSuccess: () => {
      toast.success("用户创建成功");
      utils.user.list.invalidate();
      setIsCreateDialogOpen(false);
      setCreateFormData({ openId: "", name: "", email: "", password: "", role: "user" });
    },
    onError: (error) => {
      toast.error("创建失败：" + error.message);
    },
  });

  const updateUserMutation = trpc.user.update.useMutation({
    onSuccess: () => {
      toast.success("用户信息已更新");
      utils.user.list.invalidate();
      setIsEditDialogOpen(false);
      setEditFormData(null);
    },
    onError: (error) => {
      toast.error("更新失败：" + error.message);
    },
  });

  const deleteUserMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      toast.success("用户已删除");
      utils.user.list.invalidate();
      setDeleteUserId(null);
    },
    onError: (error) => {
      toast.error("删除失败：" + error.message);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createFormData.openId.trim()) {
      toast.error("请输入用户ID");
      return;
    }
    if (!createFormData.name.trim()) {
      toast.error("请输入姓名");
      return;
    }
    if (createFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }
    if (createFormData.password && createFormData.password.length < 6) {
      toast.error("密码至少6位");
      return;
    }

    createUserMutation.mutate({
      openId: createFormData.openId.trim(),
      name: createFormData.name.trim(),
      email: createFormData.email.trim() || undefined,
      password: createFormData.password.trim() || undefined,
      role: createFormData.role,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData) return;

    if (!editFormData.name.trim()) {
      toast.error("请输入姓名");
      return;
    }
    if (editFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }
    if (editFormData.password && editFormData.password.length < 6) {
      toast.error("密码至少6位");
      return;
    }

    updateUserMutation.mutate({
      userId: editFormData.userId,
      name: editFormData.name.trim(),
      email: editFormData.email.trim() || null,
      password: editFormData.password.trim() || undefined,
      role: editFormData.role,
    });
  };

  const handleEdit = (user: any) => {
    setEditFormData({
      userId: user.id,
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (userId: number) => {
    setDeleteUserId(userId);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate({ userId: deleteUserId });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">用户管理</h1>
            <p className="text-muted-foreground mt-2">管理系统用户、权限和密码</p>
          </div>
          
          {/* 创建用户对话框 */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                创建用户
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateSubmit}>
                <DialogHeader>
                  <DialogTitle>创建新用户</DialogTitle>
                  <DialogDescription>
                    手动创建一个新的系统用户账户
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="openId">
                      用户ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="openId"
                      placeholder="例如：user_12345"
                      value={createFormData.openId}
                      onChange={(e) => setCreateFormData({ ...createFormData, openId: e.target.value })}
                      disabled={createUserMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      唯一标识符，用于系统内部识别用户
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">
                      姓名 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="例如：张三"
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      disabled={createUserMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱（可选）</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="例如：user@example.com"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      disabled={createUserMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">密码（可选，至少6位）</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="留空则不设置密码"
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      disabled={createUserMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">角色</Label>
                    <Select
                      value={createFormData.role}
                      onValueChange={(value: "user" | "admin") => 
                        setCreateFormData({ ...createFormData, role: value })
                      }
                      disabled={createUserMutation.isPending}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">普通用户</SelectItem>
                        <SelectItem value="admin">管理员</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={createUserMutation.isPending}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        创建中
                      </>
                    ) : (
                      "创建用户"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 编辑用户对话框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>编辑用户</DialogTitle>
                <DialogDescription>
                  修改用户信息、角色或重置密码
                </DialogDescription>
              </DialogHeader>
              
              {editFormData && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">
                      姓名 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      disabled={updateUserMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-email">邮箱</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      disabled={updateUserMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-password">新密码（留空则不修改）</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      placeholder="至少6位"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      disabled={updateUserMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-role">角色</Label>
                    <Select
                      value={editFormData.role}
                      onValueChange={(value: "user" | "admin" | "auditor") => 
                        setEditFormData({ ...editFormData, role: value })
                      }
                      disabled={updateUserMutation.isPending}
                    >
                      <SelectTrigger id="edit-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">普通用户</SelectItem>
                        <SelectItem value="admin">管理员</SelectItem>
                        <SelectItem value="auditor">审核员</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={updateUserMutation.isPending}
                >
                  取消
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      保存中
                    </>
                  ) : (
                    "保存更改"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <AlertDialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除用户？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作无法撤销。该用户的所有数据将被永久删除。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteUserMutation.isPending}>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteUserMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    删除中
                  </>
                ) : (
                  "确认删除"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            </CardContent>
          </Card>
        ) : users && users.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>用户列表</CardTitle>
              <CardDescription>共 {users.length} 名用户</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{user.name || "未命名"}</p>
                        <Badge variant={user.role === "admin" ? "default" : user.role === "auditor" ? "secondary" : "outline"}>
                          {user.role === "admin" ? "管理员" : user.role === "auditor" ? "审核员" : "用户"}
                        </Badge>
                        {user.isDisabled === 1 && (
                          <Badge variant="destructive">已禁用</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email || "无邮箱"}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {user.openId} · 注册：{format(new Date(user.createdAt), "yyyy-MM-dd")}
                        {user.passwordHash && " · 已设置密码"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={user.isDisabled === 1 ? "default" : "destructive"}
                        size="sm"
                        onClick={() => {
                          toggleDisabledMutation.mutate({
                            userId: user.id,
                            isDisabled: user.isDisabled === 1 ? false : true,
                          });
                        }}
                        disabled={toggleDisabledMutation.isPending}
                      >
                        {user.isDisabled === 1 ? "启用" : "禁用"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">暂无用户</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
