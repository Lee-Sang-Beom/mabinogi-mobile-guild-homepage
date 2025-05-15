"use client";

import Hero from "@/app/(home)/_components/hero";
import { useEffect, useState } from "react";
import CollaborativeGuild from "@/app/(home)/_components/collaborative-guild";
import { User } from "next-auth";
import IntroAnimation from "@/app/(home)/_components/info-animation";
import GuildStats from "./guild-stats";
import GuildFeatures from "./guild-features";
import GuildActivities from "./guild-activites";
import JoinGuild from "@/app/(home)/_components/join-guild";

interface HomeProps {
  user: User | null;
}
export default function Home({ user }: HomeProps) {
  const [showIntro, setShowIntro] = useState(false); // 기본 false
  const [isReady, setIsReady] = useState(false); // hydration 이후 렌더링을 위한 준비 상태

  useEffect(() => {
    // hydration 이후 실행
    const hasSeenIntro =
      !!user || localStorage.getItem("hasSeenIntro") === "true";

    if (!hasSeenIntro) {
      setShowIntro(true); // 인트로 보여주기
      document.body.style.overflow = "hidden"; // 스크롤 방지
    }

    setIsReady(true); // 렌더링 시작
  }, [user]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    document.body.style.overflow = ""; // 인트로 끝나면 스크롤 복구
    localStorage.setItem("hasSeenIntro", "true"); // 여기서 기록
  };

  // hydration이 끝나지 않았으면 아무것도 안 보여줌 (Next.js hydration warning 방지용)
  if (!isReady) return null;

  return (
    <>
      {showIntro && <IntroAnimation onCompleteAction={handleIntroComplete} />}
      <div className={showIntro ? "invisible" : "visible"}>
        <Hero />
        <GuildStats />
        <GuildFeatures />
        <GuildActivities />
        <CollaborativeGuild />
        <JoinGuild />
      </div>
    </>
  );
}
