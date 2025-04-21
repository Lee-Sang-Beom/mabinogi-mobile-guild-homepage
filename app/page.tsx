"use client";

import Hero from "@/app/(home)/_components/hero";
import GuildFeatures from "./(home)/_components/guild-features";
import GuildStats from "./(home)/_components/guild-stats";
import GuildActivities from "./(home)/_components/guild-activites";
import JoinGuild from "./(home)/_components/join-guild";
import { useEffect, useState } from "react";
import IntroAnimation from "./(home)/_components/info-animation";

export default function Home() {
  const [showIntro, setShowIntro] = useState(false); // 기본 false
  const [isReady, setIsReady] = useState(false); // hydration 이후 렌더링을 위한 준비 상태

  useEffect(() => {
    // hydration 이후 실행
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");

    if (!hasSeenIntro) {
      localStorage.setItem("hasSeenIntro", "true");
      setShowIntro(true); // 인트로 보여주기
      document.body.style.overflow = "hidden"; // 스크롤 방지
    }

    setIsReady(true); // 렌더링 시작
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    document.body.style.overflow = ""; // 인트로 끝나면 스크롤 복구
  };

  // hydration이 끝나지 않았으면 아무것도 안 보여줌 (Next.js hydration warning 방지용)
  if (!isReady) return null;

  return (
    <>
      {showIntro && <IntroAnimation onCompleteAction={handleIntroComplete} />}
      <div className={showIntro ? "invisible" : "visible"}>
        <Hero />
        <GuildFeatures />
        <GuildStats />
        <GuildActivities />
        <JoinGuild />
      </div>
    </>
  );
}
