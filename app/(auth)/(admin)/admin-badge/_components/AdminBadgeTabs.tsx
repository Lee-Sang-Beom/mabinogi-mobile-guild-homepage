"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { NoticeListProps } from "@/shared/notice/internal";
import { isRoleAdmin } from "@/shared/utils/utils";
import { toast } from "sonner";
import { BadgeApprovalTab } from "./badge-approval-tab";
import BadgeGiveTab from "@/app/(auth)/(admin)/admin-badge/_components/badge-give-tab";

interface TextObjType {
  title: string;
  desc: string;
}

export default function AdminBadgeTabs({ user }: NoticeListProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("approval");
  const [activeTextObj, setActiveTextObj] = useState<TextObjType>({
    title: "",
    desc: "",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // URL 파라미터에서 탭 설정
    if (!tabParam || tabParam === "approval") {
      setActiveTab("approval");
    } else {
      setActiveTab("give");
    }
  }, [tabParam]);

  useEffect(() => {
    if (!isRoleAdmin(user)) {
      toast.error("관리자만 접근 가능한 페이지입니다.");
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (activeTab === "approval") {
      setActiveTextObj({
        title: "뱃지 관리",
        desc: "길드원들의 창의적인 아이디어가 담긴 뱃지 추가요청을 관리할 수 있습니다.",
      });
    } else if (activeTab === "approval") {
      setActiveTextObj({
        title: "뱃지 수여",
        desc: "길드원에게 뱃지를 수여할 수 있습니다.",
      });
    } else {
    }
  }, [activeTab]);
  if (!mounted) return null;

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 relative w-full max-w-full overflow-x-hidden">
      {/* Animated background elements */}
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
          <h1 className="text-3xl font-bold text-foreground">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              {activeTextObj.title}
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">{activeTextObj.desc}</p>
        </motion.div>

        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="approval" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              뱃지 관리
            </TabsTrigger>
            <TabsTrigger value="give" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              뱃지 수여
            </TabsTrigger>
          </TabsList>

          {/* 뱃지 요청 관리 */}
          <BadgeApprovalTab user={user} viewMode="grid" />

          {/*뱃지 수여 관리*/}
          <BadgeGiveTab user={user} />
        </Tabs>
      </div>
    </div>
  );
}
