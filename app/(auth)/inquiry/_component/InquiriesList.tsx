"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { guildName } from "@/shared/constants/game";
import { DataTable } from "@/components/table/data-table";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatedLoading,
  SkeletonLoading,
} from "@/components/animated-loading";
import { isRoleAdmin } from "@/shared/utils/utils";
import { useGetInquiries } from "@/app/(auth)/inquiry/hooks/use-get-inquiries";
import { InquiryResponse } from "../api";
import { InquiryListProps } from "@/app/(auth)/inquiry/internal";
import {
  inquiryColumnLabels,
  inquiryColumns,
} from "@/app/(auth)/inquiry/columns";
import { toast } from "sonner";

export default function InquiriesList({ user }: InquiryListProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { data: inquiry, isPending } = useGetInquiries();
  const isAdmin = isRoleAdmin(user);

  // 데이터 메모이제이션
  const inquiryData = useMemo(() => {
    return inquiry?.data || [];
  }, [inquiry]);

  // 상세 페이지 이동 : 비밀글 처리되어있을 때는 관리자이거나 본인만 이동 가능
  const handleInquiryClick = useCallback(
    (inquiry: InquiryResponse) => {
      if (!inquiry?.docId) return;
      const isWriteMe = user.docId === inquiry.writeUserDocId;
      const availableMove = !inquiry.isSecret || isAdmin || isWriteMe;

      if (availableMove) {
        toast.error("비밀글은 작성자 및 관리자만 확인할 수 있습니다.");
      }
      router.push(`/inquiry/${inquiry.docId}`);
    },
    [router, user, isAdmin],
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
              문의하기
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            뱃지 요청이나 {guildName} 홈페이지 건의내용을 작성할 수 있습니다.
          </p>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <>
            <div className="flex items-center justify-end mb-4 w-full">
              <Button
                variant="outline"
                className={"bg-primary text-black"}
                onClick={() => router.push("/inquiry/create")}
              >
                작성하기
              </Button>
            </div>

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
