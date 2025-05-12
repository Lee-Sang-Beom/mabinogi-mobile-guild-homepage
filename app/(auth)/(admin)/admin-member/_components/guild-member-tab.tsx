import { TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useMemo } from "react";
import { useGetUserList } from "@/app/(auth)/dashboard/hooks/use-get-user-list";
import { DataTable } from "@/components/table/data-table";
import {
  AnimatedLoading,
  SkeletonLoading,
} from "@/components/animated-loading";
import { useWithdrawnUser } from "@/app/(auth)/profile/hooks/use-withdrawn-user";
import { User } from "next-auth";
import { NoticeListProps } from "@/shared/notice/internal";
import { toast } from "sonner";
import { userColumnLabels, userColumns } from "../columns";

export default function GuildMemberTab({ user }: NoticeListProps) {
  const { data: guildMembers, isPending } = useGetUserList();
  const { mutate: withdrawnUser } = useWithdrawnUser(); // 유저 회원탈퇴 tanstack-query

  const members = useMemo(() => {
    return guildMembers || [];
  }, [guildMembers]);

  const handleDeleteUsers = useCallback(
    (selectedRows: User[]) => {
      if (selectedRows.length === 0) return;
      const includedMe = selectedRows.some((row) => row.docId === user.docId);
      if (includedMe) {
        toast.error("내 캐릭터는 프로필 페이지에서만 삭제할 수 있습니다.");
        return;
      }

      withdrawnUser({
        user: selectedRows,
        type: "WITHDRAWN",
        redirect: false,
      });
    },
    [withdrawnUser, user],
  );

  // 로딩 컴포넌트
  if (isPending) {
    return <AnimatedLoading />;
  }

  return (
    <>
      <TabsContent value="members">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-background backdrop-blur-sm border-primary/10 shadow-xl">
            <CardHeader>
              <CardTitle>길드원 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {!isPending ? (
                <DataTable
                  key={`guild-member-mng-table-${members.length}`}
                  columns={userColumns}
                  data={members}
                  searchKey="id"
                  searchPlaceholder="닉네임으로 검색..."
                  onRowClick={undefined}
                  onSelectionChange={undefined}
                  onDeleteSelected={handleDeleteUsers}
                  columnLabels={userColumnLabels}
                  deleteButtonText={"선택 탈퇴"}
                  isAvailableDelete={true}
                  getRowId={(user) => user.docId}
                />
              ) : (
                <SkeletonLoading />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>
    </>
  );
}
