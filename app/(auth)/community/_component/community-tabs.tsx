"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Info } from "lucide-react";
import CommunityArtwork from "./community-artwork";
import CommunityTips from "./community-tips";
import { useSearchParams } from "next/navigation";
import { guildName } from "@/shared/constants/game";

export default function CommunityTabs() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("artwork");
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    setMounted(true);
    if (tabParam === "tips") {
      setActiveTab("tips");
    } else if (tabParam === "artwork") {
      setActiveTab("artwork");
    }
  }, [tabParam]);

  if (!mounted) return null;

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 relative w-full max-w-full overflow-x-hidden">
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
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              커뮤니티
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {guildName} 커뮤니티에서 다양한 정보와 작품을 공유해보세요.
          </p>
        </motion.div>

        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="artwork" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {`아트워크`}
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              {`정보(팁)`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artwork">
            <CommunityArtwork />
          </TabsContent>

          <TabsContent value="tips">
            <CommunityTips />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
