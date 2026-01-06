import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Categories() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories, isLoading } = trpc.category.getAll.useQuery();
  const { data: topEntries } = trpc.translation.getTopByCategory.useQuery(
    { categoryId: selectedCategory!, limit: 20 },
    { enabled: selectedCategory !== null }
  );

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
              {isAuthenticated && (
                <Link href="/history">
                  <Button variant="ghost">查询历史</Button>
                </Link>
              )}
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline">管理后台</Button>
                </Link>
              )}
              {isAuthenticated ? (
                <span className="text-sm text-muted-foreground">{user?.name}</span>
              ) : (
                <a href={getLoginUrl()}>
                  <Button>登录</Button>
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 py-8">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">分类学习</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.map((category: any) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {category.name}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription>
                      {category.children?.length || 0} 个子分类
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {category.children && category.children.length > 0 && (
                      <div className="space-y-2">
                        {category.children.slice(0, 3).map((child: any) => (
                          <Button
                            key={child.id}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => setSelectedCategory(child.id)}
                          >
                            {child.name}
                          </Button>
                        ))}
                        {category.children.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            还有 {category.children.length - 3} 个...
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 高频词展示 */}
          {selectedCategory && topEntries && topEntries.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">该分类高频词TOP20</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topEntries.map((entry: any) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{entry.englishText}</CardTitle>
                      <CardDescription>{entry.chineseTranslation}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
