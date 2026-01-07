import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, User, Plus, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [shouldSearch, setShouldSearch] = useState(false);
  
  // 提交谐音对话框状态
  const [isHomophoneDialogOpen, setIsHomophoneDialogOpen] = useState(false);
  const [homophoneText, setHomophoneText] = useState("");

  const utils = trpc.useUtils();

  const { data: searchData, isLoading } = trpc.translation.search.useQuery(
    { text: searchText.trim() },
    { enabled: shouldSearch && searchText.trim().length > 0 }
  );

  const createHomophoneMutation = trpc.homophone.create.useMutation({
    onSuccess: () => {
      toast.success("谐音提交成功，等待审核");
      setIsHomophoneDialogOpen(false);
      setHomophoneText("");
    },
    onError: (error) => {
      toast.error("提交失败：" + error.message);
    },
  });

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

  const handleSubmitHomophone = () => {
    if (!homophoneText.trim()) {
      toast.error("请输入谐音内容");
      return;
    }
    if (!searchResult?.entry?.id) {
      toast.error("词条信息缺失");
      return;
    }

    createHomophoneMutation.mutate({
      entryId: searchResult.entry.id,
      homophoneText: homophoneText.trim(),
    });
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
    <div className="flex h-screen bg-background">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="border-b h-14 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-semibold">英语词句查询</h1>
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
          <div className="container max-w-4xl py-12 px-4">
            <div className="space-y-8">
              {/* 标题区域 */}
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">
                  快速查询英语翻译与谐音记忆
                </h2>
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
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSearch} 
                  size="lg" 
                  disabled={isLoading} 
                  className="px-8 h-12"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      查询中
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      查询
                    </>
                  )}
                </Button>
              </div>

              {/* 搜索结果 */}
              {searchResult && searchResult.found && (
                <Card className="shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">
                          {searchResult.entry.englishText}
                        </CardTitle>
                        {searchResult.categoryPath && (
                          <p className="text-sm text-muted-foreground">
                            {searchResult.categoryPath}
                          </p>
                        )}
                      </div>
                      {isAuthenticated && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsHomophoneDialogOpen(true)}
                          className="ml-4"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          提交谐音
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 中文翻译 */}
                    <div className="p-4 bg-accent/50 rounded-lg">
                      <p className="text-lg leading-relaxed">
                        {searchResult.entry.chineseTranslation}
                      </p>
                    </div>
                    
                    {/* 音标和音节 */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {searchResult.entry.ipa && (
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <span className="text-sm text-muted-foreground font-medium">
                            音标
                          </span>
                          <span className="font-mono text-base">
                            {searchResult.entry.ipa}
                          </span>
                        </div>
                      )}
                      
                      {searchResult.entry.syllables && (
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <span className="text-sm text-muted-foreground font-medium">
                            音节
                          </span>
                          <span className="font-mono text-base">
                            {searchResult.entry.syllables}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* 谐音记忆 */}
                    {searchResult.homophones && searchResult.homophones.length > 0 && (
                      <div className="pt-4 border-t space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          谐音记忆
                        </h3>
                        <div className="space-y-2">
                          {searchResult.homophones.map((h: any) => (
                            <div 
                              key={h.id} 
                              className="p-3 bg-primary/5 border border-primary/20 rounded-lg"
                            >
                              <p className="text-base leading-relaxed">
                                {h.homophoneText}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 无谐音提示 */}
                    {(!searchResult.homophones || searchResult.homophones.length === 0) && isAuthenticated && (
                      <div className="pt-4 border-t">
                        <div className="text-center py-6 text-muted-foreground">
                          <p className="mb-3">暂无谐音记忆</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsHomophoneDialogOpen(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            成为第一个提交谐音的人
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 提交谐音对话框 */}
      <Dialog open={isHomophoneDialogOpen} onOpenChange={setIsHomophoneDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>提交谐音记忆</DialogTitle>
            <DialogDescription>
              为 <span className="font-semibold text-foreground">{searchResult?.entry?.englishText}</span> 添加谐音记忆
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="homophone">谐音内容 *</Label>
              <Textarea
                id="homophone"
                value={homophoneText}
                onChange={(e) => setHomophoneText(e.target.value)}
                placeholder="例如：apple → 阿婆"
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                提示：谐音需经过至少2名审核员审核通过后才会显示
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsHomophoneDialogOpen(false);
                setHomophoneText("");
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleSubmitHomophone}
              disabled={createHomophoneMutation.isPending || !homophoneText.trim()}
            >
              {createHomophoneMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中
                </>
              ) : (
                "提交"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
