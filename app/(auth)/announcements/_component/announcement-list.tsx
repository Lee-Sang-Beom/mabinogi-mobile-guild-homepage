"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { guildName } from "@/shared/constants/game";
import { DataTable } from "@/components/table/data-table";
import { useRouter } from "next/navigation";
import { useGetAnnouncements } from "@/app/(auth)/announcements/hooks/use-get-announcements";
import { useDeleteAnnouncement } from "@/app/(auth)/announcements/hooks/use-delete-announcement";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatedLoading,
  SkeletonLoading,
} from "@/components/animated-loading";
import { toast } from "sonner";
import { isRoleAdmin } from "@/shared/utils/utils";
import { NoticeListProps } from "@/shared/notice/internal";
import {
  nonSelectionNoticeColumns,
  noticeColumnLabels,
  noticeColumns,
} from "@/shared/notice/columns";
import { NoticeResponse } from "@/shared/notice/api";

export default function AnnouncementsList({ user }: NoticeListProps) {
  const router = useRouter();
  const isAdmin = isRoleAdmin(user);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { data: notice, isPending } = useGetAnnouncements();
  const { mutate: deleteNotice } = useDeleteAnnouncement();

  // 데이터 메모이제이션
  const noticeData = useMemo(() => {
    return notice?.data || [];
  }, [notice]);

  const handleDeleteNotices = useCallback(
    (selectedRows: NoticeResponse[]) => {
      if (selectedRows.length === 0) return;
      if (!isAdmin) {
        toast.error(
          "삭제할 권한이 없습니다. 길드 마스터 혹은 서브 마스터만 삭제할 수 있습니다.",
        );
        return;
      }

      const selectedDocIds = selectedRows.map((row) => row.docId);
      deleteNotice(selectedDocIds);
    },
    [deleteNotice, isAdmin],
  );

  // 공지사항 상세 페이지로 이동 - useCallback으로 메모이제이션
  const handleNoticeClick = useCallback(
    (notice: NoticeResponse) => {
      if (!notice?.docId) return;
      router.push(`/announcements/${notice.docId}`);
    },
    [router],
  );

  // 선택 변경 핸들러 - useCallback으로 메모이제이션
  const handleSelectionChange = useCallback(
    (selectedRows: NoticeResponse[]) => {
      // 필요한 경우 여기서 선택된 행 처리
      console.log("선택된 행:", selectedRows.length);
    },
    [],
  );

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    setIsMounted(true);

    // 컴포넌트 언마운트 시 정리
    return () => {
      setIsMounted(false);
    };
  }, []);

  // 로딩 컴포넌트
  if (isPending) {
    return <AnimatedLoading />;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative w-full max-w-full overflow-x-hidden">
      {/* 배경 애니메이션 */}
      <motion.div
        className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 20,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-1/4 bottom-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-amber-500/10 to-red-500/10 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 25,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              공지사항
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {guildName}의 중요 소식과 안내사항을 확인하세요.
          </p>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <>
            {isAdmin && (
              <div className="flex items-center justify-end mb-4 w-full">
                <Button
                  variant="outline"
                  className={"bg-primary text-black"}
                  onClick={() => router.push("/announcements/create")}
                >
                  작성하기
                </Button>
              </div>
            )}

            <Card>
              <CardContent className="p-3 sm:p-6">
                {isMounted && !isPending ? (
                  <DataTable
                    key={`announcements-table-${noticeData.length}`}
                    columns={
                      isAdmin ? noticeColumns : nonSelectionNoticeColumns
                    }
                    data={noticeData}
                    searchKey="title"
                    searchPlaceholder="제목으로 검색..."
                    onRowClick={handleNoticeClick}
                    onSelectionChange={handleSelectionChange}
                    onDeleteSelected={handleDeleteNotices}
                    columnLabels={noticeColumnLabels}
                    deleteButtonText={"선택 삭제"}
                    isAvailableDelete={isAdmin}
                    getRowId={(notice) => notice.docId}
                  />
                ) : (
                  <SkeletonLoading />
                )}
              </CardContent>
            </Card>
          </>
        </motion.div>
      </div>
    </div>
  );
}
