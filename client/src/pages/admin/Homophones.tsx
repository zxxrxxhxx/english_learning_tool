import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminHomophones() {
  const [selectedHomophone, setSelectedHomophone] = useState<any>(null);
  const [auditOpinion, setAuditOpinion] = useState("");
  const [auditAction, setAuditAction] = useState<"approve" | "reject">("approve");

  const utils = trpc.useUtils();
  const { data: pendingHomophones, isLoading } = trpc.homophone.getPending.useQuery();

  const auditMutation = trpc.homophone.audit.useMutation({
    onSuccess: () => {
      toast.success("审核完成");
      setSelectedHomophone(null);
      setAuditOpinion("");
      utils.homophone.getPending.invalidate();
    },
    onError: (error) => {
      toast.error("审核失败：" + error.message);
    },
  });

  const handleAudit = () => {
    if (!selectedHomophone) return;
    
    auditMutation.mutate({
      homophoneId: selectedHomophone.id,
      action: auditAction,
      opinion: auditOpinion || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">谐音审核</h1>
          <p className="text-muted-foreground mt-2">审核待处理的谐音记忆</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">加载中...</p>
            </CardContent>
          </Card>
        ) : pendingHomophones && pendingHomophones.length > 0 ? (
          <div className="space-y-4">
            {pendingHomophones.map((homophone: any) => (
              <Card key={homophone.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>
                        {homophone.entry?.englishText || "（词条已删除）"}
                      </CardTitle>
                      <CardDescription>
                        {homophone.entry?.chineseTranslation}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedHomophone(homophone);
                          setAuditAction("approve");
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        通过
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedHomophone(homophone);
                          setAuditAction("reject");
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        拒绝
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                      谐音内容
                    </h3>
                    <p className="text-lg">{homophone.homophoneText}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">提交者：</span>
                      {homophone.submitter?.name || "未知"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">提交时间：</span>
                      {format(new Date(homophone.createdAt), "yyyy-MM-dd HH:mm")}
                    </div>
                    <div>
                      <span className="text-muted-foreground">已通过审核：</span>
                      {homophone.approvalCount} / 2
                    </div>
                    {homophone.auditDeadline && (
                      <div>
                        <span className="text-muted-foreground">审核截止：</span>
                        {format(new Date(homophone.auditDeadline), "yyyy-MM-dd HH:mm")}
                      </div>
                    )}
                  </div>
                  {homophone.auditRecords && homophone.auditRecords.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                        审核记录
                      </h3>
                      <div className="space-y-2">
                        {homophone.auditRecords.map((record: any) => (
                          <div key={record.id} className="text-sm border-l-2 pl-3">
                            <p>
                              <span className="font-semibold">审核员 #{record.auditorId}</span>
                              {" "}
                              <span className={record.action === "approve" ? "text-green-600" : "text-red-600"}>
                                {record.action === "approve" ? "通过" : "拒绝"}
                              </span>
                            </p>
                            {record.opinion && (
                              <p className="text-muted-foreground">{record.opinion}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">暂无待审核谐音</p>
            </CardContent>
          </Card>
        )}

        {/* 审核对话框 */}
        <Dialog open={!!selectedHomophone} onOpenChange={(open) => !open && setSelectedHomophone(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {auditAction === "approve" ? "通过审核" : "拒绝审核"}
              </DialogTitle>
              <DialogDescription>
                {auditAction === "approve" 
                  ? "确认通过此谐音记忆吗？" 
                  : "请说明拒绝原因"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>审核意见{auditAction === "reject" && " *"}</Label>
                <Textarea
                  value={auditOpinion}
                  onChange={(e) => setAuditOpinion(e.target.value)}
                  placeholder={auditAction === "approve" ? "可选" : "请说明拒绝原因"}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedHomophone(null)}>
                取消
              </Button>
              <Button
                onClick={handleAudit}
                disabled={auditMutation.isPending || (auditAction === "reject" && !auditOpinion)}
                variant={auditAction === "approve" ? "default" : "destructive"}
              >
                确认{auditAction === "approve" ? "通过" : "拒绝"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
