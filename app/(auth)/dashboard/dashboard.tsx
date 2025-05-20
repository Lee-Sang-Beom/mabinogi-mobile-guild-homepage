"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

import { User } from "next-auth";
import DashboardGuildInfo from "./_components/dashboard-guild-info";
import DashboardGuildUserBubbleDialog from "@/app/(auth)/dashboard/_components/dashboard-guild-user-bubble-dialog";
import DashboardAnnouncement from "./_components/dashboard-announcement";
import DashboardUpdate from "./_components/dashboard-update";
import DashboardArtwork from "./_components/dashboard-artwork";
import DashboardJobClass from "./_components/dashboard-job-class";
import DashboardIntroduceGuildMember from "./_components/dashboard-introduce-guild-member";
import DashboardSchedule from "./_components/dashboard-schedule";
import { useGetLatestSchedule } from "@/app/(auth)/dashboard/hooks/use-get-latest-schedule";
import { useGetLatestAnnouncement } from "@/app/(auth)/dashboard/hooks/use-get-latest-announcement";
import { useGetLatestUpdate } from "@/app/(auth)/dashboard/hooks/use-get-latest-update";
import { useGetLatestArtworkCommunity } from "@/app/(auth)/dashboard/hooks/use-get-latest-artwork-community";
import { AnimatedLoading } from "@/components/animated-loading";
import DashboardRankBadgeCount from "@/app/(auth)/dashboard/_components/dashboard-rank-badge-count";

interface DashboardProps {
  user: User;
}
export default function Dashboard({ user }: DashboardProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, {
    once: false,
    amount: 0, // 더 빠르게 트리거
    margin: "0px 0px -20% 0px",
  });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  const { data: schedules, isPending: isSchedulesLoading } =
    useGetLatestSchedule();
  const { data: announcement, isPending: isAnnounceLoading } =
    useGetLatestAnnouncement();
  const { data: update, isPending: isUpdateLoading } = useGetLatestUpdate();
  const { data: artwork, isPending: isArtworkLoading } =
    useGetLatestArtworkCommunity();

  return (
    <>
      <div className="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
        {isSchedulesLoading ||
        isAnnounceLoading ||
        isUpdateLoading ||
        isArtworkLoading ? (
          <AnimatedLoading
            className={"fixed left-0 top-0 min-h-screen max-h-screen"}
          />
        ) : (
          <></>
        )}

        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl"
            animate={{
              x: [0, 20, 0],
              y: [0, 15, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 20,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-amber-500/10 to-red-500/10 blur-3xl"
            animate={{
              x: [0, -15, 0],
              y: [0, 25, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 25,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto" ref={containerRef}>
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-foreground font-cinzel">
              <motion.span
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                대시보드
              </motion.span>
            </h1>
            <p className="text-muted-foreground mt-2">
              길드의 최신 정보와 활동을 확인하세요.
            </p>
          </motion.div>

          <div className={"w-full mb-8"}>
            <motion.div
              initial="hidden"
              animate={controls}
              variants={fadeInUpVariants}
            >
              <DashboardGuildInfo />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* 길드 정보 */}
            <motion.div
              custom={0}
              initial="hidden"
              animate={controls}
              variants={fadeInUpVariants}
            >
              <DashboardRankBadgeCount />
            </motion.div>

            {/* 파티찾기 */}
            <motion.div
              custom={1}
              initial="hidden"
              animate={controls}
              variants={fadeInUpVariants}
            >
              <DashboardSchedule data={schedules} />
            </motion.div>

            {/* 공지사항 */}
            <motion.div
              custom={2}
              initial="hidden"
              animate={controls}
              variants={fadeInUpVariants}
            >
              <DashboardAnnouncement data={announcement} />
            </motion.div>

            {/* 업데이트 */}
            <motion.div
              custom={3}
              initial="hidden"
              animate={controls}
              variants={fadeInUpVariants}
            >
              <DashboardUpdate data={update} />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* 아트워크 */}
            <motion.div
              custom={4}
              initial="hidden"
              animate={controls}
              variants={fadeInUpVariants}
            >
              <DashboardArtwork data={artwork} />
            </motion.div>

            {/* 직업별 길드원 분포 */}
            <motion.div
              custom={5}
              initial="hidden"
              animate={controls}
              variants={fadeInUpVariants}
            >
              <DashboardJobClass />
            </motion.div>
          </div>

          {/* 길드원 소개 */}
          <motion.div
            custom={6}
            initial="hidden"
            animate={controls}
            variants={fadeInUpVariants}
            className="mb-8"
          >
            <DashboardIntroduceGuildMember
              user={user}
              setSelectedUser={setSelectedUser}
            />
          </motion.div>
        </div>

        {/* Member detail dialog */}
        {selectedUser && (
          <DashboardGuildUserBubbleDialog
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        )}
      </div>
    </>
  );
}
