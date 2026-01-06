import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
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
    <div className="flex h-screen">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="border-b h-14 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">分类学习</h1>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">登录</Button>
              </a>
            )}
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-auto p-6">
          <div className="container max-w-6xl">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories?.map((category: any) => (
                  <Card key={category.id} className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-3">
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
                <h3 className="text-lg font-semibold mb-4">该分类高频词TOP20</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topEntries.map((entry: any) => (
                    <Card key={entry.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{entry.englishText}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{entry.chineseTranslation}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
