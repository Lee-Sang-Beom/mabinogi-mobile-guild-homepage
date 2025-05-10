"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ArtworkCard from "./artwork-card";
import { useGetCommunity } from "../hooks/use-get-community";
import { Palette } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AnimatedLoading } from "@/components/animated-loading";

export default function CommunityArtwork() {
  const router = useRouter();
  const { data: noticeData, isPending } = useGetCommunity("artwork");

  // 로딩 컴포넌트
  if (isPending) {
    return <AnimatedLoading />;
  }

  return (
    <div className="w-full h-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-end w-full">
          <Button
            variant="outline"
            className={"bg-primary text-black"}
            onClick={() => router.push("/community/create?tab=artwork")}
          >
            작성하기
          </Button>
        </div>
      </motion.div>

      <Separator className="my-4 bg-gray-800/50" />

      {noticeData?.data && noticeData?.data.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pr-2 max-h-[480px] sm:max-h-[620px] overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {noticeData.data.map((notice) => (
            <ArtworkCard key={notice.docId} noticeData={notice} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-background/60 backdrop-blur-sm border-primary/10 shadow-xl overflow-hidden h-[200px] flex gap-2 items-center justify-center rounded-2xl">
            <Palette className="w-8 h-8" />
            등록된 아트워크 정보가 없습니다.
          </div>
        </motion.div>
      )}
    </div>
  );
}
