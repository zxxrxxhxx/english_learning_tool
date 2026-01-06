import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, FileText, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const { data: topWords } = trpc.stats.topWords.useQuery({ limit: 10 });
  const { data: users } = trpc.user.list.useQuery();
  const { data: pendingHomophones } = trpc.homophone.getPending.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">管理后台</h1>
          <p className="text-muted-foreground mt-2">英语学习工具管理控制台</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">待审核谐音</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingHomophones?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">热门词汇</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topWords?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">系统状态</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">正常</div>
            </CardContent>
          </Card>
        </div>

        {/* 热词榜单 */}
        <Card>
          <CardHeader>
            <CardTitle>热词榜单 TOP10</CardTitle>
            <CardDescription>查询次数最多的词汇</CardDescription>
          </CardHeader>
          <CardContent>
            {topWords && topWords.length > 0 ? (
              <div className="space-y-4">
                {topWords.map((word: any, index: number) => (
                  <div key={word.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{word.englishText}</p>
                        <p className="text-sm text-muted-foreground">{word.chineseTranslation}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {word.queryCount} 次查询
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">暂无数据</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
