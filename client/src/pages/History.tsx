import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Trash2, Loader2, History as HistoryIcon, Search, LogIn } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function History() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const utils = trpc.useUtils();
  const { data: histories, isLoading } = trpc.history.list.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

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

  const handleClearAll = () => {
    if (confirm("确定要清空所有历史记录吗？此操作不可恢复。")) {
      clearMutation.mutate();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="border-b h-14 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-semibold">查询历史</h1>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user?.name}</span>
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm" variant="outline">登录</Button>
              </a>
            )}
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl py-8 px-4">
            {!isAuthenticated ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full shadow-lg">
                  <CardContent className="pt-12 pb-12 text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <LogIn className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">需要登录</h3>
                      <p className="text-muted-foreground">
                        登录后可查看您的查询历史记录
                      </p>
                    </div>
                    <a href={getLoginUrl()} className="inline-block">
                      <Button size="lg">
                        <LogIn className="w-4 h-4 mr-2" />
                        立即登录
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {/* 标题区域 */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">
                      查询历史
                    </h2>
                    <p className="text-muted-foreground">
                      {histories && histories.length > 0 
                        ? `共 ${histories.length} 条记录`
                        : "暂无查询记录"
                      }
                    </p>
                  </div>
                  {histories && histories.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleClearAll}
                      disabled={clearMutation.isPending}
                    >
                      {clearMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          清空中
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          清空全部
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : histories && histories.length > 0 ? (
                  <div className="space-y-3">
                    {histories.map((history: any) => (
                      <Card 
                        key={history.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">
                                  {history.entry?.englishText || "（已删除）"}
                                </CardTitle>
                                {history.entry?.ipa && (
                                  <span className="text-sm font-mono text-muted-foreground">
                                    {history.entry.ipa}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {history.entry?.chineseTranslation || "词条已被删除"}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 flex-shrink-0"
                              onClick={() => deleteMutation.mutate({ historyId: history.id })}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HistoryIcon className="w-3 h-3" />
                            <span>
                              {format(new Date(history.queryTime), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-lg">
                    <CardContent className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold mb-2">暂无查询历史</p>
                          <p className="text-sm text-muted-foreground mb-6">
                            开始查询单词，记录会自动保存在这里
                          </p>
                          <Button onClick={() => setLocation("/")}>
                            <Search className="w-4 h-4 mr-2" />
                            开始查询
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
