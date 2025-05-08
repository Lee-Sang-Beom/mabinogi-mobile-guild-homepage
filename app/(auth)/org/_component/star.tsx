"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { hexToRgba } from "@/shared/utils/utils";
import { User } from "next-auth";
import { UserStar } from "@/app/(auth)/org/internal";

interface StarProps {
  user: User;
  star: UserStar;
  mousePosition: { x: number; y: number };
  onClickAction: () => void;
}

export function Star({ user, star, mousePosition, onClickAction }: StarProps) {
  const isUserStar = star.docId === user.docId;
  const [position, setPosition] = useState({ x: star.x || 0, y: star.y || 0 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setAngle] = useState(star.orbitOffset || 0);
  const animationRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  // 별 움직임 애니메이션
  useEffect(() => {
    if (!star.centerX || !star.centerY || !star.orbitRadius || !star.orbitSpeed)
      return;

    const animate = () => {
      setAngle((prevAngle) => {
        const newAngle = prevAngle + star.orbitSpeed!;

        // 타원 궤도 계산
        const eccentricity = star.orbitEccentricity || 0.2;
        const orbitAngle = star.orbitAngle || 0;

        // 타원 방정식
        const a = star.orbitRadius!; // 장축
        const b = star.orbitRadius! * (1 - eccentricity); // 단축

        // 회전된 타원 좌표 계산
        const x0 = a * Math.cos(newAngle);
        const y0 = b * Math.sin(newAngle);

        // 회전 변환 적용
        const x = x0 * Math.cos(orbitAngle) - y0 * Math.sin(orbitAngle);
        const y = x0 * Math.sin(orbitAngle) + y0 * Math.cos(orbitAngle);

        setPosition({
          x: star.centerX! + x,
          y: star.centerY! + y,
        });

        return newAngle;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    star.centerX,
    star.centerY,
    star.orbitRadius,
    star.orbitSpeed,
    star.orbitEccentricity,
    star.orbitAngle,
  ]);

  // 마우스 위치에 따른 시차 효과 계산
  const parallaxX = (mousePosition.x - window.innerWidth / 2) * 0.01;
  const parallaxY = (mousePosition.y - window.innerHeight / 2) * 0.01;

  // 별 색상 계산
  const starColor = star.color
    ? hexToRgba(star.color, isUserStar ? 1 : 0.8)
    : isUserStar
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(255, 255, 255, 0.8)";

  const glowColor = star.color
    ? hexToRgba(star.color, isUserStar ? 1 : 0.4)
    : isUserStar
      ? "rgba(255, 255, 255, 0.6)"
      : "rgba(255, 255, 255, 0.4)";

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) translate(${parallaxX}px, ${parallaxY}px)`,
        zIndex: 10,
        padding: "10px", // 클릭 영역 확장
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      onClick={onClickAction}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 별 */}
      <div
        className="rounded-full transition-all duration-300"
        style={{
          width:
            star.docId === user.docId
              ? "10px"
              : `${(star.size || 3) * (isHovered ? 1.5 : 1)}px`,
          height:
            star.docId === user.docId
              ? "10px"
              : `${(star.size || 3) * (isHovered ? 1.5 : 1)}px`,
          backgroundImage:
            star.docId === user.docId
              ? "linear-gradient(135deg, #ffffff, #f0f0f0, #eaeaea)"
              : "none",
          backgroundColor:
            star.docId === user.docId ? "transparent" : starColor,
          boxShadow: `0 0 ${(star.size || 3) * 3}px ${star.size || 3}px ${glowColor}`,
          transition: "all 0.3s ease",
        }}
      />

      {/* 호버 시 직업 표시 */}
      {isHovered && (
        <div className="absolute left-1/2 top-full -translate-x-1/2 mt-1 text-xs text-white whitespace-nowrap bg-black/50 px-2 py-0.5 rounded">
          {star.id} ({star.job})
        </div>
      )}
    </motion.div>
  );
}
