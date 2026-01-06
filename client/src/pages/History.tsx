import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* 顶部导航 */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">英语学习工具</h1>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost">首页</Button>
              </Link>
              <Link href="/categories">
                <Button variant="ghost">分类学习</Button>
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline">管理后台</Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground">{user?.name}</span>
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">查询历史</h2>
            {histories && histories.length > 0 && (
              <Button
                variant="destructive"
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
            <div className="space-y-4">
              {histories.map((history: any) => (
                <Card key={history.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {history.entry?.englishText || "（已删除）"}
                        </CardTitle>
                        <CardDescription>
                          {history.entry?.chineseTranslation}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate({ historyId: history.id })}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      查询时间：{format(new Date(history.queryTime), "yyyy-MM-dd HH:mm:ss")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">暂无查询历史</p>
                <Link href="/">
                  <Button className="mt-4">开始查询</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
