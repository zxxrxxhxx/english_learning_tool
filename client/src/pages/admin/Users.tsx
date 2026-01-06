import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminUsers() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.user.list.useQuery();

  const toggleDisabledMutation = trpc.user.toggleDisabled.useMutation({
    onSuccess: () => {
      toast.success("操作成功");
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error("操作失败：" + error.message);
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground mt-2">管理系统用户和权限</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">加载中...</p>
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
                  <div key={user.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{user.name || "未命名"}</p>
                        <Badge variant={user.role === "admin" ? "default" : user.role === "auditor" ? "secondary" : "outline"}>
                          {user.role === "admin" ? "管理员" : user.role === "auditor" ? "审核员" : "用户"}
                        </Badge>
                        {user.isDisabled === 1 && (
                          <Badge variant="destructive">已禁用</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email || "无邮箱"}</p>
                      <p className="text-xs text-muted-foreground">
                        注册时间：{format(new Date(user.createdAt), "yyyy-MM-dd HH:mm")}
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
