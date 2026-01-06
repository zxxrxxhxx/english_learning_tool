import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
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
              <Link href="/categories">
                <Button variant="ghost" size="sm">分类学习</Button>
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

      {/* 主内容区 */}
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container max-w-3xl">
          <div className="text-center space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold">英语词句查询</h2>
              <p className="text-muted-foreground">
                预存3万+核心词库，支持音标、音节划分和人工审核谐音
              </p>
            </div>

            {/* 搜索框 */}
            <div className="flex gap-2">
              <Input
                placeholder="输入英语单词或短语"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="text-base h-12"
              />
              <Button onClick={handleSearch} size="lg" disabled={isLoading} className="px-8">
                <Search className="w-4 h-4 mr-2" />
                查询
              </Button>
            </div>

            {/* 搜索结果 */}
            {searchResult && searchResult.found && (
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="text-2xl">{searchResult.entry.englishText}</CardTitle>
                  {searchResult.categoryPath && (
                    <p className="text-sm text-muted-foreground">{searchResult.categoryPath}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-base">{searchResult.entry.chineseTranslation}</p>
                  </div>
                  
                  {searchResult.entry.ipa && (
                    <div className="flex gap-2 text-sm">
                      <span className="text-muted-foreground">音标:</span>
                      <span className="font-mono">{searchResult.entry.ipa}</span>
                    </div>
                  )}
                  
                  {searchResult.entry.syllables && (
                    <div className="flex gap-2 text-sm">
                      <span className="text-muted-foreground">音节:</span>
                      <span className="font-mono">{searchResult.entry.syllables}</span>
                    </div>
                  )}
                  
                  {searchResult.homophones && searchResult.homophones.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground mb-1">谐音记忆</p>
                      {searchResult.homophones.map((h: any) => (
                        <p key={h.id} className="text-base text-secondary">
                          {h.homophoneText}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>英语学习工具 © 2024</p>
        </div>
      </footer>
    </div>
  );
}
