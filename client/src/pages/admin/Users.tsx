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
import { UserPlus, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AdminUsers() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.user.list.useQuery();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    openId: "",
    name: "",
    email: "",
    role: "user" as "user" | "admin",
  });

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
      setIsDialogOpen(false);
      setFormData({ openId: "", name: "", email: "", role: "user" });
    },
    onError: (error) => {
      toast.error("创建失败：" + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.openId.trim()) {
      toast.error("请输入用户ID");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("请输入姓名");
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }

    createUserMutation.mutate({
      openId: formData.openId.trim(),
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      role: formData.role,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">用户管理</h1>
            <p className="text-muted-foreground mt-2">管理系统用户和权限</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                创建用户
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
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
                      value={formData.openId}
                      onChange={(e) => setFormData({ ...formData, openId: e.target.value })}
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={createUserMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱（可选）</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="例如：user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={createUserMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">角色</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: "user" | "admin") => 
                        setFormData({ ...formData, role: value })
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
                    onClick={() => setIsDialogOpen(false)}
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
                      </p>
                    </div>
                    <Button
                      variant={user.isDisabled === 1 ? "default" : "destructive"}
                      size="sm"
                      onClick={() => {
                        if (confirm(`确定要${user.isDisabled === 1 ? "启用" : "禁用"}此用户吗？`)) {
                          toggleDisabledMutation.mutate({
                            userId: user.id,
                            isDisabled: user.isDisabled === 1 ? false : true,
                          });
                        }
                      }}
                      disabled={toggleDisabledMutation.isPending}
                      className="flex-shrink-0"
                    >
                      {user.isDisabled === 1 ? "启用" : "禁用"}
                    </Button>
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
