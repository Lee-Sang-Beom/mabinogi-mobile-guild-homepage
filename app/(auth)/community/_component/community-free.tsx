"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatedLoading,
  SkeletonLoading,
} from "@/components/animated-loading";
import {
  nonSelectionNoticeColumns,
  noticeColumnLabels,
} from "@/shared/notice/columns";
import { NoticeResponse } from "@/shared/notice/api";
import { useGetCommunity } from "../hooks/use-get-community";
import { useDeleteCommunity } from "../hooks/use-delete-community";

export default function CommunityFree() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { data: notice, isPending } = useGetCommunity("free");
  const { mutate: deleteNotice } = useDeleteCommunity("free");

  const noticeData = useMemo(() => {
    return notice?.data || [];
  }, [notice]);

  const handleDeleteNotices = useCallback(
    (selectedRows: NoticeResponse[]) => {
      if (selectedRows.length === 0) return;

      const selectedDocIds = selectedRows.map((row) => row.docId);
      deleteNotice(selectedDocIds);
    },
    [deleteNotice],
  );

  const handleNoticeClick = useCallback(
    (notice: NoticeResponse) => {
      if (!notice?.docId) return;
      router.push(`/community/${notice.docId}?tab=free`);
    },
    [router],
  );

  const handleSelectionChange = useCallback(
    (_selectedRows: NoticeResponse[]) => {},
    [],
  );

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  // 로딩 컴포넌트
  if (isPending) {
    return <AnimatedLoading />;
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-end mb-4 w-full">
        <Button
          variant="outline"
          className={"bg-primary text-black"}
          onClick={() => router.push("/community/create?tab=free")}
        >
          작성하기
        </Button>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-6">
          {isMounted && !isPending ? (
            <DataTable
              key={`community-free-table-${noticeData.length}`}
              columns={nonSelectionNoticeColumns}
              data={noticeData}
              searchKey="title"
              searchPlaceholder="제목으로 검색..."
              onRowClick={handleNoticeClick}
              onSelectionChange={handleSelectionChange}
              onDeleteSelected={handleDeleteNotices}
              columnLabels={noticeColumnLabels}
              deleteButtonText="선택 삭제"
              isAvailableDelete={false}
              getRowId={(notice) => notice.docId}
            />
          ) : (
            <SkeletonLoading />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
