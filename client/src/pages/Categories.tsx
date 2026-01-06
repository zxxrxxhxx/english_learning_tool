import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="border-b backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              <h1 className="text-xl font-bold">英语学习工具</h1>
            </div>
            <nav className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">首页</Button>
              </Link>
              {isAuthenticated && (
                <Link href="/history">
                  <Button variant="ghost" size="sm">查询历史</Button>
                </Link>
              )}
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">管理</Button>
                </Link>
              )}
              {isAuthenticated ? (
                <span className="text-sm text-muted-foreground">{user?.name}</span>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm">登录</Button>
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 py-8">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">分类学习</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories?.map((category: any) => (
                <Card key={category.id} className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      {category.name}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {category.children && category.children.length > 0 && (
                      <div className="space-y-1">
                        {category.children.slice(0, 3).map((child: any) => (
                          <Button
                            key={child.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm h-8"
                            onClick={() => setSelectedCategory(child.id)}
                          >
                            {child.name}
                          </Button>
                        ))}
                        {category.children.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center pt-1">
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
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">该分类高频词TOP20</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {topEntries.map((entry: any) => (
                  <Card key={entry.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{entry.englishText}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{entry.chineseTranslation}</p>
                    </CardContent>
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
