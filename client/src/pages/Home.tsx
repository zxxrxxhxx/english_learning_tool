import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
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
    <div className="flex h-screen">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="border-b h-14 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">英语词句查询</h1>
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
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl py-12">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">快速查询英语翻译与谐音记忆</h2>
                <p className="text-muted-foreground text-sm">
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
                  className="text-base h-11"
                />
                <Button onClick={handleSearch} size="lg" disabled={isLoading} className="px-6">
                  <Search className="w-4 h-4 mr-2" />
                  查询
                </Button>
              </div>

              {/* 搜索结果 */}
              {searchResult && searchResult.found && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">{searchResult.entry.englishText}</CardTitle>
                    {searchResult.categoryPath && (
                      <p className="text-xs text-muted-foreground">{searchResult.categoryPath}</p>
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
                          <p key={h.id} className="text-base">
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
      </div>
    </div>
  );
}
