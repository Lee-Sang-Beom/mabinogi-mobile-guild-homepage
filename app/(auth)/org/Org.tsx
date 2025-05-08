"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { NoticeListProps } from "@/shared/notice/internal";
import StarryOrganization from "@/app/(auth)/org/_component/starry-organization";
import { useGetUserList } from "@/app/(auth)/dashboard/hooks/use-get-user-list";
import AnimatedStarLoading from "@/app/(auth)/org/_component/animated-star-loading";

export default function Org({ user }: NoticeListProps) {
  const { data, isLoading, isError } = useGetUserList();
  const [text, setText] = useState<string>("별자리 정보를 불러오고 있습니다.");
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) return; // 로딩 중일 때는 아무 동작도 하지 않음

    if (isError) {
      setText("데이터를 불러오는 데 문제가 발생했습니다.");
      return;
    }

    if (data && data.length > 0) {
      setText("구성원들의 별을 그리고 있습니다.");

      // 3초 후에 데이터를 로드 완료 처리
      const timer = setTimeout(() => setIsDataLoaded(true), 5000);

      return () => clearTimeout(timer); // 타이머 클리어
    }
  }, [data, isLoading, isError]);

  return (
    <main className="min-h-screen w-full overflow-hidden">
      {/* 로딩 화면이 끝날 때까지 AnimatedStarLoading을 표시 */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isDataLoaded ? 0 : 1 }}
        transition={{ duration: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: isDataLoaded ? -1 : 1, // 데이터가 로드되면 뒤로 보내기
        }}
      >
        {!isDataLoaded && <AnimatedStarLoading text={text} />}
      </motion.div>

      {/* 데이터 로딩 완료 후 StarryOrganization 표시 */}
      {isDataLoaded && (
        <motion.div
          key="starry-org"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <StarryOrganization user={user} users={data!} />
        </motion.div>
      )}
    </main>
  );
}
