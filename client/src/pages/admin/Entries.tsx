import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminEntries() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const pageSize = 20;

  // 获取词条列表
  const { data, isLoading, refetch } = trpc.entry.list.useQuery({
    page,
    pageSize,
    search: search || undefined,
  });

  // 新增/编辑对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [formData, setFormData] = useState({
    englishText: "",
    chineseTranslation: "",
    ipa: "",
    syllables: "",
    categoryId: 1,
    homophoneText: "",
  });

  // 删除确认对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 创建词条
  const createMutation = trpc.entry.create.useMutation({
    onSuccess: () => {
      toast.success("词条添加成功");
      setDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`添加失败: ${error.message}`);
    },
  });

  // 更新词条
  const updateMutation = trpc.entry.update.useMutation({
    onSuccess: () => {
      toast.success("词条更新成功");
      setDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    },
  });

  // 删除词条
  const deleteMutation = trpc.entry.delete.useMutation({
    onSuccess: () => {
      toast.success("词条删除成功");
      setDeleteDialogOpen(false);
      setDeletingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      englishText: "",
      chineseTranslation: "",
      ipa: "",
      syllables: "",
      categoryId: 1,
      homophoneText: "",
    });
    setEditingEntry(null);
  };

  const handleAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      englishText: entry.englishText,
      chineseTranslation: entry.chineseTranslation,
      ipa: entry.ipa || "",
      syllables: entry.syllables || "",
      categoryId: entry.categoryId,
      homophoneText: entry.homophones?.[0]?.homophoneText || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.englishText || !formData.chineseTranslation) {
      toast.error("请填写英文原文和中文译文");
      return;
    }

    if (editingEntry) {
      updateMutation.mutate({
        id: editingEntry.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">词库管理</h1>
            <p className="text-muted-foreground mt-1">
              管理英语词条、音标、译文和谐音
            </p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            添加词条
          </Button>
        </div>

        {/* 搜索栏 */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索英文或中文..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary">
            搜索
          </Button>
          {search && (
            <Button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
              variant="outline"
            >
              清除
            </Button>
          )}
        </div>

        {/* 词条列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>英文原文</TableHead>
                    <TableHead>音标</TableHead>
                    <TableHead>中文译文</TableHead>
                    <TableHead>谐音</TableHead>
                    <TableHead>分类ID</TableHead>
                    <TableHead>查询次数</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.id}</TableCell>
                      <TableCell className="font-semibold">
                        {entry.englishText}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.ipa || "-"}
                      </TableCell>
                      <TableCell>{entry.chineseTranslation}</TableCell>
                      <TableCell className="text-sm">
                        {entry.homophones?.length > 0
                          ? entry.homophones[0].homophoneText
                          : "-"}
                      </TableCell>
                      <TableCell>{entry.categoryId}</TableCell>
                      <TableCell>{entry.queryCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(entry.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 分页 */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                共 {data.total} 条记录，第 {page} / {totalPages} 页
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  下一页
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border rounded-lg">
            <p className="text-muted-foreground">暂无词条</p>
            <Button onClick={handleAdd} variant="outline" className="mt-4">
              添加第一个词条
            </Button>
          </div>
        )}

        {/* 新增/编辑对话框 */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "编辑词条" : "添加新词条"}
              </DialogTitle>
              <DialogDescription>
                填写词条信息，带*为必填项
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="englishText">英文原文 *</Label>
                <Input
                  id="englishText"
                  placeholder="例如: apple"
                  value={formData.englishText}
                  onChange={(e) =>
                    setFormData({ ...formData, englishText: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="chineseTranslation">中文译文 *</Label>
                <Textarea
                  id="chineseTranslation"
                  placeholder="例如: 苹果（一种常见水果）"
                  value={formData.chineseTranslation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      chineseTranslation: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ipa">国际音标</Label>
                  <Input
                    id="ipa"
                    placeholder="例如: /ˈæpl/"
                    value={formData.ipa}
                    onChange={(e) =>
                      setFormData({ ...formData, ipa: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="syllables">音节划分</Label>
                  <Input
                    id="syllables"
                    placeholder="例如: ap-ple"
                    value={formData.syllables}
                    onChange={(e) =>
                      setFormData({ ...formData, syllables: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryId">分类ID</Label>
                <Input
                  id="categoryId"
                  type="number"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="homophoneText">谐音</Label>
                <Textarea
                  id="homophoneText"
                  placeholder="例如: 爱剖（谐音记忆）"
                  value={formData.homophoneText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homophoneText: e.target.value,
                    })
                  }
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  填写后将自动审核通过
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingEntry ? "保存" : "添加"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                此操作无法撤销。确定要删除这个词条吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingId) {
                    deleteMutation.mutate({ id: deletingId });
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
