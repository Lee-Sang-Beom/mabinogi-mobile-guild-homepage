"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { hexToRgba } from "@/shared/utils/utils";
import type { User } from "next-auth";
import type { UserStar } from "@/app/(auth)/org/internal";

interface StarProps {
  user: User;
  star: UserStar;
  userBadgeCount: number;
  mousePosition: { x: number; y: number };
  onClickAction: () => void;
}

export function Star({
  user,
  star,
  userBadgeCount,
  mousePosition,
  onClickAction,
}: StarProps) {
  const isUserStar = star.docId === user.docId;
  const [position, setPosition] = useState({ x: star.x || 0, y: star.y || 0 });
  const [_angle, setAngle] = useState(star.orbitOffset || 0);
  const animationRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  // ⭐️ 뱃지 개수에 따른 별 크기와 반짝임 설정
  const MIN_SIZE = 6;
  const MAX_SIZE = 24;
  const MIN_GLOW = 8;
  const MAX_GLOW = 50;

  // 뱃지 개수에 따른 비선형 스케일링 (더 극적인 효과를 위해)
  const badgeScale = Math.sqrt(userBadgeCount + 1); // 비선형 스케일링

  // 별 크기 계산 (뱃지 개수에 따라 증가)
  const starSize = Math.min(MAX_SIZE, MIN_SIZE + badgeScale * 3.5);

  // 반짝임 크기 계산 (뱃지 개수에 따라 증가)
  const glowSize = Math.min(MAX_GLOW, MIN_GLOW + badgeScale * 5);

  // 반짝임 강도 계산 (뱃지 개수에 따라 증가)
  const glowIntensity = Math.min(1, 0.3 + badgeScale * 0.1);

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
        const a = star.orbitRadius!;
        const b = star.orbitRadius! * (1 - eccentricity);

        const x0 = a * Math.cos(newAngle);
        const y0 = b * Math.sin(newAngle);

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

  // 별 색상 계산 - 뱃지 개수에 따라 색상 밝기 조절
  const baseColor = star.color || "#ffffff";
  const starColor = star.color
    ? hexToRgba(
        star.color,
        isUserStar ? 1 : Math.min(0.8, 0.5 + badgeScale * 0.05),
      )
    : isUserStar
      ? "rgba(255, 255, 255, 0.9)"
      : `rgba(255, 255, 255, ${Math.min(0.8, 0.5 + badgeScale * 0.05)})}`;

  // 반짝임 색상 - 뱃지 개수에 따라 강도 조절
  const glowColor = star.color
    ? hexToRgba(star.color, glowIntensity)
    : `rgba(255, 255, 255, ${glowIntensity})`;

  // 뱃지 개수에 따른 추가 애니메이션 효과
  const pulseAnimation =
    userBadgeCount > 5
      ? {
          boxShadow: [
            `0 0 ${glowSize}px ${glowSize / 2}px ${glowColor}`,
            `0 0 ${glowSize * 1.2}px ${glowSize / 1.5}px ${glowColor}`,
            `0 0 ${glowSize}px ${glowSize / 2}px ${glowColor}`,
          ],
          scale: [1, 1.05, 1],
        }
      : undefined;

  // 수정된 코드: 애니메이션 적용 방식 변경
  const hasPulseAnimation = userBadgeCount > 3;

  // 뱃지 개수에 따른 그라데이션 효과
  const getGradient = () => {
    if (userBadgeCount <= 1) {
      return "none";
    } else if (userBadgeCount <= 3) {
      return `linear-gradient(135deg, ${baseColor}, ${hexToRgba(baseColor, 0.7)})`;
    } else if (userBadgeCount <= 5) {
      return `linear-gradient(135deg, #ffffff, ${baseColor}, ${hexToRgba(baseColor, 0.7)})`;
    } else {
      return `linear-gradient(135deg, #ffffff, ${baseColor}, #ffffff, ${baseColor})`;
    }
  };

  // 별 모양의 점들을 생성하는 함수
  const generateStarPoints = (points: number) => {
    let result = "";
    const outerRadius = 50; // 외부 반지름 (%)
    const innerRadius = 20; // 내부 반지름 (%)

    for (let i = 0; i < points * 2; i++) {
      // 각도 계산 (360도를 points*2로 나눔)
      const angle = (i * Math.PI) / points;
      // 반지름은 짝수 인덱스일 때 외부, 홀수 인덱스일 때 내부
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      // x, y 좌표 계산 (중심이 50%, 50%인 원 위의 점)
      const x = 50 + radius * Math.sin(angle);
      const y = 50 - radius * Math.cos(angle);

      result += `${x}% ${y}%${i < points * 2 - 1 ? ", " : ""}`;
    }

    return result;
  };

  // 뱃지 개수에 따라 별 모양의 복잡도 증가
  const points = Math.min(10, 5 + Math.floor(userBadgeCount / 3));
  const clipPathValue = `polygon(${generateStarPoints(points)})`;
  const size = starSize * (isHovered ? 1.5 : 1);

  // 뱃지 개수에 따른 회전 속도 조정 (뱃지가 많을수록 빠르게 회전)
  const rotationSpeed = 10 + Math.min(20, userBadgeCount * 2);

  // 회전 방향 (별마다 다르게 설정)
  const rotationDirection = (star.docId?.charCodeAt(0) || 0) % 2 === 0 ? 1 : -1;

  return (
    <motion.div
      className="absolute cursor-pointer sparkle-animation"
      data-star-id={star.docId}
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) translate(${parallaxX}px, ${parallaxY}px)`,
        zIndex: 10,
        padding: "10px",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      onClick={onClickAction}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 별 모양 - 회전 애니메이션 추가 */}
      <motion.div
        style={{
          position: "relative" as const,
          width: `${size}px`,
          height: `${size}px`,
          clipPath: clipPathValue,
          backgroundImage: userBadgeCount > 0 ? getGradient() : "none",
          backgroundColor: userBadgeCount > 0 ? "transparent" : starColor,
          boxShadow: `0 0 ${glowSize}px ${glowSize / 2}px ${glowColor}`,
          transition: "all 0.3s ease",
        }}
        animate={{
          ...pulseAnimation,
          rotate: rotationDirection * 360, // 360도 회전 (시계 또는 반시계 방향)
        }}
        transition={{
          duration: hasPulseAnimation ? 3 : undefined,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse" as const,
          rotate: {
            duration: 60 / rotationSpeed, // 회전 속도 조절 (초 단위)
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop" as const,
          },
        }}
      />

      {/* 뱃지 개수가 많을 때 추가 반짝임 효과 */}
      {userBadgeCount > 8 && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: "transparent",
            clipPath: clipPathValue,
          }}
          animate={{
            boxShadow: [
              `0 0 ${glowSize * 1.5}px ${glowSize}px rgba(255, 255, 255, 0)`,
              `0 0 ${glowSize * 1.5}px ${glowSize}px rgba(255, 255, 255, 0.2)`,
              `0 0 ${glowSize * 1.5}px ${glowSize}px rgba(255, 255, 255, 0)`,
            ],
            rotate: rotationDirection * 360, // 반짝임 효과도 함께 회전
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            rotate: {
              duration: 60 / rotationSpeed,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop" as const,
            },
          }}
        />
      )}

      {/* 호버 시 직업 표시 */}
      {isHovered && (
        <div className="absolute left-1/2 top-full -translate-x-1/2 mt-1 text-xs text-white whitespace-nowrap bg-black/50 px-2 py-0.5 rounded">
          {star.id} ({star.job})
        </div>
      )}
    </motion.div>
  );
}
