"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatedLoading,
  SkeletonLoading,
} from "@/components/animated-loading";
import {
  inquiryColumnLabels,
  inquiryColumns,
} from "@/app/(auth)/inquiry/columns";
import { InquiryResponse } from "@/app/(auth)/inquiry/api";
import { useGetInProgressInquiries } from "@/app/(auth)/(admin)/admin-inquiry/hooks/use-get-in-progress-inquiries";
import { isRoleAdmin } from "@/shared/utils/utils";
import { toast } from "sonner";
import { InquiryListProps } from "@/app/(auth)/inquiry/internal";

export default function AdminInquiriesList({ user }: InquiryListProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { data: inquiry, isPending } = useGetInProgressInquiries();

  useEffect(() => {
    if (!isRoleAdmin(user)) {
      toast.error("관리자만 접근 가능한 페이지입니다.");
      router.push("/dashboard");
    }
  }, [user, router]);

  // 데이터 메모이제이션
  const inquiryData = useMemo(() => {
    return inquiry?.data || [];
  }, [inquiry]);

  // 상세 페이지 이동 : 비밀글 처리되어있을 때는 관리자이거나 본인만 이동 가능
  const handleInquiryClick = useCallback(
    (inquiry: InquiryResponse) => {
      if (!inquiry?.docId) return;
      router.push(`/admin-inquiry/${inquiry.docId}`);
    },
    [router],
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
              문의 관리
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            길드원의 문의 내용에 대해 답변할 수 있습니다.
          </p>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <>
            <Card>
              <CardContent className="p-3 sm:p-6">
                {isMounted && !isPending ? (
                  <DataTable
                    key={`inquiry-table-${inquiryData.length}`}
                    columns={inquiryColumns}
                    data={inquiryData}
                    searchKey="title"
                    searchPlaceholder="제목으로 검색..."
                    onRowClick={handleInquiryClick}
                    onSelectionChange={undefined}
                    onDeleteSelected={undefined}
                    columnLabels={inquiryColumnLabels}
                    deleteButtonText={"선택 삭제"}
                    isAvailableDelete={false}
                    getRowId={(inquiry) => inquiry.docId}
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
