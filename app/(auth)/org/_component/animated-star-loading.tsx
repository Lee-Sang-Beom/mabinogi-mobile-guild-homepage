"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

interface Star {
  id: number;
  x: string;
  y: string;
  size: string;
  opacity: number;
  scale: number;
  duration: number;
  delay: number;
}

interface AnimatedStarLoadingProps {
  text: string; // 텍스트를 props로 받기
}

export default function AnimatedStarLoading({
  text,
}: AnimatedStarLoadingProps) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // 클라이언트에서만 별 데이터 생성
    const generatedStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 + "vw", // 랜덤 X 좌표
      y: Math.random() * 100 + "vh", // 랜덤 Y 좌표
      size: Math.random() * 4 + 2 + "px", // 크기
      opacity: Math.random() * 0.8 + 0.2, // 불투명도
      scale: Math.random() * 0.8 + 0.3, // 별의 크기
      duration: Math.random() * 2 + 2, // 빠른 애니메이션
      delay: Math.random() * 0.5, // 지연 시간
    }));
    setStars(generatedStars);
  }, []);

  return (
    <main className="min-h-screen w-full overflow-hidden">
      {/* 배경 별 애니메이션 */}
      <div className="relative w-full h-screen bg-gradient-to-b from-[#0f1729] to-[#000000] overflow-hidden text-white">
        <div className="absolute inset-0 pointer-events-none z-0">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute bg-white rounded-full"
              initial={{ opacity: 0, scale: 0, y: "-100vh" }} // 화면 밖에서 시작
              animate={{
                opacity: star.opacity,
                scale: star.scale,
                x: star.x,
                y: "100vh", // 별들이 화면 아래로 떨어짐
              }}
              transition={{
                duration: star.duration,
                delay: star.delay, // 각 별의 시작 시간 지연
                repeat: Infinity, // 무한 반복
                ease: "easeInOut", // 부드럽게 애니메이션 진행
              }}
              style={{
                width: star.size,
                height: star.size,
              }}
            />
          ))}
        </div>

        {/* 텍스트 애니메이션 */}
        <motion.div
          className="relative z-10 flex justify-center items-center h-full text-2xl font-bold tracking-wide"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {text}
        </motion.div>
      </div>
    </main>
  );
}
