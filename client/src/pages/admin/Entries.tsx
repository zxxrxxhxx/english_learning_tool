import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminEntries() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    englishText: "",
    chineseTranslation: "",
    ipa: "",
    syllables: "",
    categoryId: 1,
    homophoneText: "",
  });

  const utils = trpc.useUtils();
  
  const createMutation = trpc.entry.create.useMutation({
    onSuccess: () => {
      toast.success("词条创建成功");
      setOpen(false);
      setFormData({
        englishText: "",
        chineseTranslation: "",
        ipa: "",
        syllables: "",
        categoryId: 1,
        homophoneText: "",
      });
    },
    onError: (error) => {
      toast.error("创建失败：" + error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.englishText || !formData.chineseTranslation) {
      toast.error("请填写必填字段");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">词库管理</h1>
            <p className="text-muted-foreground mt-2">管理英语词条和翻译</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加词条
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新词条</DialogTitle>
                <DialogDescription>填写词条信息，带*为必填项</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="englishText">英文原文 *</Label>
                  <Input
                    id="englishText"
                    value={formData.englishText}
                    onChange={(e) => setFormData({ ...formData, englishText: e.target.value })}
                    placeholder="例如：apple"
                  />
                </div>
                <div>
                  <Label htmlFor="chineseTranslation">中文译文 *</Label>
                  <Textarea
                    id="chineseTranslation"
                    value={formData.chineseTranslation}
                    onChange={(e) => setFormData({ ...formData, chineseTranslation: e.target.value })}
                    placeholder="例如：苹果（一种常见水果）"
                  />
                </div>
                <div>
                  <Label htmlFor="ipa">国际音标</Label>
                  <Input
                    id="ipa"
                    value={formData.ipa}
                    onChange={(e) => setFormData({ ...formData, ipa: e.target.value })}
                    placeholder="例如：/ˈæpl/"
                  />
                </div>
                <div>
                  <Label htmlFor="syllables">音节划分</Label>
                  <Input
                    id="syllables"
                    value={formData.syllables}
                    onChange={(e) => setFormData({ ...formData, syllables: e.target.value })}
                    placeholder="例如：ap·ple"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryId">分类ID</Label>
                  <Input
                    id="categoryId"
                    type="number"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="homophoneText">谐音</Label>
                  <Textarea
                    id="homophoneText"
                    value={formData.homophoneText}
                    onChange={(e) => setFormData({ ...formData, homophoneText: e.target.value })}
                    placeholder="例如：阿婆"
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    管理员添加的谐音将自动审核通过
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                  创建
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>词库列表</CardTitle>
            <CardDescription>当前系统中的所有词条</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              词库列表功能开发中，请使用添加词条功能
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
