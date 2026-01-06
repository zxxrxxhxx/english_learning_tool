import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminStats() {
  const utils = trpc.useUtils();
  const { data: topWords } = trpc.stats.topWords.useQuery({ limit: 50 });
  const { data: unrecordedWords } = trpc.stats.unrecordedWords.useQuery({ limit: 100 });

  const deleteUnrecordedMutation = trpc.stats.deleteUnrecordedWord.useMutation({
    onSuccess: () => {
      toast.success("已删除");
      utils.stats.unrecordedWords.invalidate();
    },
    onError: (error) => {
      toast.error("删除失败：" + error.message);
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">数据统计</h1>
          <p className="text-muted-foreground mt-2">查看系统数据和统计信息</p>
        </div>

        {/* 热词榜单 */}
        <Card>
          <CardHeader>
            <CardTitle>热词榜单 TOP50</CardTitle>
            <CardDescription>查询次数最多的词汇</CardDescription>
          </CardHeader>
          <CardContent>
            {topWords && topWords.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {topWords.map((word: any, index: number) => (
                  <div key={word.id} className="flex items-center gap-4 border-b pb-2">
                    <span className="text-lg font-bold text-muted-foreground w-8">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">{word.englishText}</p>
                      <p className="text-sm text-muted-foreground">{word.chineseTranslation}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {word.queryCount} 次
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">暂无数据</p>
            )}
          </CardContent>
        </Card>

        {/* 未收录词管理 */}
        <Card>
          <CardHeader>
            <CardTitle>未收录词管理</CardTitle>
            <CardDescription>用户查询但词库中不存在的词汇</CardDescription>
          </CardHeader>
          <CardContent>
            {unrecordedWords && unrecordedWords.length > 0 ? (
              <div className="space-y-2">
                {unrecordedWords.map((word: any) => (
                  <div key={word.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-semibold">{word.word}</p>
                      <p className="text-sm text-muted-foreground">
                        请求 {word.requestCount} 次
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("确定要删除此记录吗？")) {
                          deleteUnrecordedMutation.mutate({ id: word.id });
                        }
                      }}
                      disabled={deleteUnrecordedMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">暂无未收录词</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
