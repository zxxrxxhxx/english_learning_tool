import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

export default function History() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const utils = trpc.useUtils();
  const { data: histories, isLoading } = trpc.history.list.useQuery({ limit: 100 });

  const deleteMutation = trpc.history.delete.useMutation({
    onSuccess: () => {
      toast.success("已删除");
      utils.history.list.invalidate();
    },
    onError: (error) => {
      toast.error("删除失败：" + error.message);
    },
  });

  const clearMutation = trpc.history.clear.useMutation({
    onSuccess: () => {
      toast.success("已清空所有历史记录");
      utils.history.list.invalidate();
    },
    onError: (error) => {
      toast.error("清空失败：" + error.message);
    },
  });

  return (
    <div className="flex h-screen">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="border-b h-14 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">查询历史</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              <span>{user?.name}</span>
            </div>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-auto p-6">
          <div className="container max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">历史记录</h2>
              {histories && histories.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("确定要清空所有历史记录吗？")) {
                      clearMutation.mutate();
                    }
                  }}
                  disabled={clearMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清空全部
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : histories && histories.length > 0 ? (
              <div className="space-y-3">
                {histories.map((history: any) => (
                  <Card key={history.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {history.entry?.englishText || "（已删除）"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {history.entry?.chineseTranslation}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteMutation.mutate({ historyId: history.id })}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(history.queryTime), "yyyy-MM-dd HH:mm:ss")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">暂无查询历史</p>
                  <Button onClick={() => setLocation("/")}>开始查询</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
