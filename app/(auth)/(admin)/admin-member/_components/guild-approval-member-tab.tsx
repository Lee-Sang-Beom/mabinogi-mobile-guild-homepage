import { TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sword, User as UserIcon, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getJobClassColor,
  JobClassIcons,
} from "@/app/(auth)/dashboard/job-class-utils";
import { useUpdateApprovalJoinYn } from "../hooks/use-update-approval-join";
import { useWithdrawnUser } from "@/app/(auth)/profile/hooks/use-withdrawn-user";
import { User } from "next-auth";
import { AnimatedLoading } from "@/components/animated-loading";
import { useGetUnapprovedUsers } from "@/app/(auth)/(admin)/admin-member/hooks/use-get-unapproval-user";

export default function GuildApprovalMemberTab() {
  const { data: pendingMembers, isPending } = useGetUnapprovedUsers();
  const updateApprovalJoinYnMutation = useUpdateApprovalJoinYn();
  const withdrawnUserMutation = useWithdrawnUser(); // 유저 회원탈퇴 tanstack-query

  const handleApprovePendingMember = (docId: string) => {
    updateApprovalJoinYnMutation.mutate(docId);
  };
  const handleRejectPendingMember = (user: User) => {
    withdrawnUserMutation.mutate({
      user: user,
      type: "REJECTED",
      redirect: false,
    });
  };

  // 로딩 컴포넌트
  if (isPending) {
    return <AnimatedLoading />;
  }

  return (
    <TabsContent value="approval">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-background/80 backdrop-blur-sm border-primary/10 shadow-xl">
          <CardHeader>
            <CardTitle>가입 대기 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {!pendingMembers || pendingMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                대기 중인 가입 신청이 없습니다.
              </div>
            ) : (
              <div className="space-y-6">
                {pendingMembers.map((pendingMember) => {
                  const Icon = JobClassIcons[pendingMember.job] || Sword;
                  const iconColor = getJobClassColor(pendingMember.job);

                  return (
                    <div
                      key={pendingMember.id}
                      className="p-4 bg-background/50 rounded-lg border border-primary/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{pendingMember.id}</h3>
                            <div className="flex items-center text-sm text-muted-foreground gap-1">
                              <Icon
                                className="h-6 w-6"
                                style={{ color: iconColor }}
                              />
                              <span>{pendingMember.job}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          신청일: {pendingMember.mngDt}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          onClick={() =>
                            handleRejectPendingMember(pendingMember)
                          }
                        >
                          반려(거절)
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                          onClick={() =>
                            handleApprovePendingMember(pendingMember.docId)
                          }
                        >
                          <UserCheck className="h-4 w-4 mr-1" /> 승인
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </TabsContent>
  );
}
