import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ChevronRight, Loader2, FolderOpen } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Categories() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");

  const { data: categories, isLoading } = trpc.category.getAll.useQuery();
  const { data: topEntries, isLoading: isLoadingEntries } = trpc.translation.getTopByCategory.useQuery(
    { categoryId: selectedCategory!, limit: 20 },
    { enabled: selectedCategory !== null }
  );

  const handleCategoryClick = (id: number, name: string) => {
    setSelectedCategory(id);
    setSelectedCategoryName(name);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="border-b h-14 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-semibold">分类学习</h1>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user?.name}</span>
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">登录</Button>
              </a>
            )}
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-7xl py-8 px-4">
            {/* 标题区域 */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                按分类学习
              </h2>
              <p className="text-muted-foreground">
                浏览三级分类体系，查看各类别下的高频词汇
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                {categories?.map((category: any) => (
                  <Card 
                    key={category.id} 
                    className="hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FolderOpen className="w-5 h-5 text-primary" />
                          {category.name}
                        </CardTitle>
                        {category.children && category.children.length > 0 && (
                          <Badge variant="secondary">
                            {category.children.length}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {category.children && category.children.length > 0 ? (
                        <div className="space-y-2">
                          {category.children.slice(0, 5).map((child: any) => (
                            <Button
                              key={child.id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-between text-sm h-9 hover:bg-accent"
                              onClick={() => handleCategoryClick(child.id, `${category.name} > ${child.name}`)}
                            >
                              <span className="truncate">{child.name}</span>
                              <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />
                            </Button>
                          ))}
                          {category.children.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                              还有 {category.children.length - 5} 个子分类...
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          暂无子分类
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* 高频词展示 */}
            {selectedCategory && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">高频词 TOP 20</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedCategoryName}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedCategoryName("");
                    }}
                  >
                    关闭
                  </Button>
                </div>

                {isLoadingEntries ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : topEntries && topEntries.length > 0 ? (
                  <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4">
                    {topEntries.map((entry: any, index: number) => (
                      <Card 
                        key={entry.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">
                              {entry.englishText}
                            </CardTitle>
                            <Badge variant="outline" className="ml-2">
                              {index + 1}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {entry.chineseTranslation}
                          </p>
                          {entry.ipa && (
                            <p className="text-xs font-mono text-muted-foreground mt-2">
                              {entry.ipa}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">该分类暂无词条</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
