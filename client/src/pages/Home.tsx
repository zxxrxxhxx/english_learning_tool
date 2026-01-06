import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Search, History, Layout } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);

  const [shouldSearch, setShouldSearch] = useState(false);

  const { data: searchData, isLoading } = trpc.translation.search.useQuery(
    { text: searchText.trim() },
    { enabled: shouldSearch && searchText.trim().length > 0 }
  );

  const handleSearch = () => {
    if (!searchText.trim()) {
      toast.error("请输入要查询的单词或短语");
      return;
    }
    if (searchText.length > 50) {
      toast.error("请输入50字符内的单词或短句");
      return;
    }
    setShouldSearch(true);
    setSearchResult(null);
  };

  // 更新搜索结果
  if (searchData && shouldSearch) {
    if (searchData !== searchResult) {
      setSearchResult(searchData);
      if (!searchData.found) {
        toast.info(searchData.message);
      }
      setShouldSearch(false);
    }
  }

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
              <Link href="/categories">
                <Button variant="ghost">分类学习</Button>
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{user?.name}</span>
                </div>
              ) : (
                <a href={getLoginUrl()}>
                  <Button>登录</Button>
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1">
        {/* Hero区域 */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-4xl font-bold text-foreground">
                快速查询英语翻译与谐音记忆
              </h2>
              <p className="text-lg text-muted-foreground">
                预存3万+核心词库，毫秒级响应，支持音标、音节划分和人工审核谐音
              </p>

              {/* 搜索框 */}
              <div className="flex gap-2 max-w-xl mx-auto">
                <Input
                  placeholder="输入英语单词或短语（≤50字符）"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="text-lg"
                />
                <Button onClick={handleSearch} size="lg" disabled={isLoading}>
                  <Search className="w-5 h-5 mr-2" />
                  查询
                </Button>
              </div>

              {/* 搜索结果 */}
              {searchResult && searchResult.found && (
                <Card className="text-left mt-8">
                  <CardHeader>
                    <CardTitle className="text-2xl">{searchResult.entry.englishText}</CardTitle>
                    <CardDescription>{searchResult.categoryPath}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">中文译文</h3>
                      <p className="text-lg">{searchResult.entry.chineseTranslation}</p>
                    </div>
                    
                    {searchResult.entry.ipa && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">国际音标</h3>
                        <p className="text-lg font-mono">{searchResult.entry.ipa}</p>
                      </div>
                    )}
                    
                    {searchResult.entry.syllables && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">音节划分</h3>
                        <p className="text-lg font-mono">{searchResult.entry.syllables}</p>
                      </div>
                    )}
                    
                    {searchResult.homophones && searchResult.homophones.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                          谐音记忆（人工审核）
                        </h3>
                        {searchResult.homophones.map((h: any) => (
                          <p key={h.id} className="text-lg text-secondary">
                            {h.homophoneText}
                            <span className="text-sm text-muted-foreground ml-2">
                              （注：仅为记忆辅助，非准确对应）
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* 功能特点 */}
        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Search className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>高效查询</CardTitle>
                  <CardDescription>
                    数据库预存高频词句，毫秒级响应，无需实时翻译
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Layout className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>分级学习</CardTitle>
                  <CardDescription>
                    三级分类体系，覆盖日常、工作、考试等场景
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <History className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>历史追踪</CardTitle>
                  <CardDescription>
                    保留3个月查询记录，支持复习与回顾
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t py-8 bg-white">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 英语学习工具. 专注于提供高质量的英语学习体验</p>
        </div>
      </footer>
    </div>
  );
}
