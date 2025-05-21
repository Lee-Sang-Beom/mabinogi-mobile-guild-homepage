"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { hexToRgba } from "@/shared/utils/utils";
import { StarTier, UserStar } from "@/app/(auth)/org/internal";
import {
  getBadgeTier,
  getBadgeTierKo,
  getStarBaseColor,
} from "@/app/(auth)/org/utils";

export interface StarProps {
  star: UserStar;
  userBadgeCount: number;
  mousePosition: { x: number; y: number };
  onClickAction: () => void;
}

export function Star({
  star,
  userBadgeCount,
  mousePosition,
  onClickAction,
}: StarProps) {
  const [position, setPosition] = useState({ x: star.x || 0, y: star.y || 0 });
  const [_angle, setAngle] = useState(star.orbitOffset || 0);
  const animationRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  const tier: StarTier = getBadgeTier(userBadgeCount);

  // Size configuration based on 10 tiers with more dramatic progression
  const sizeConfig = {
    novice: { size: 8, glow: 3, intensity: 0.15 },
    beginner: { size: 12, glow: 8, intensity: 0.25 },
    apprentice: { size: 16, glow: 14, intensity: 0.35 },
    intermediate: { size: 20, glow: 20, intensity: 0.45 },
    skilled: { size: 25, glow: 30, intensity: 0.55 },
    advanced: { size: 30, glow: 40, intensity: 0.65 },
    expert: { size: 35, glow: 55, intensity: 0.75 },
    master: { size: 40, glow: 70, intensity: 0.85 },
    grandmaster: { size: 45, glow: 85, intensity: 0.95 },
    legendary: { size: 50, glow: 100, intensity: 1.0 },
  };

  const starSize = sizeConfig[tier].size;
  const glowSize = sizeConfig[tier].glow;
  const glowIntensity = sizeConfig[tier].intensity;

  // Orbital movement
  useEffect(() => {
    if (!star.centerX || !star.centerY || !star.orbitRadius || !star.orbitSpeed)
      return;

    const animate = () => {
      setAngle((prevAngle) => {
        const newAngle = prevAngle + star.orbitSpeed!;
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

  // Parallax effect - 더 강화된 시차 효과
  const parallaxX =
    (mousePosition.x - window.innerWidth / 2) *
    (0.005 + sizeConfig[tier].intensity * 0.02);
  const parallaxY =
    (mousePosition.y - window.innerHeight / 2) *
    (0.005 + sizeConfig[tier].intensity * 0.02);

  const baseColor: string = getStarBaseColor(tier, star);
  const starColor = hexToRgba(baseColor, Math.min(0.9, 0.5 + glowIntensity));
  const glowColor = hexToRgba(baseColor, glowIntensity);

  // Enhanced gradient effect based on 10 badge tiers
  const getGradient = () => {
    switch (tier) {
      case "novice":
        return `${baseColor}`; // 단색

      case "beginner":
        return `linear-gradient(135deg, #dddddd, ${baseColor})`; // 간단한 그라데이션

      case "apprentice":
        return `linear-gradient(135deg, #ffffff, ${baseColor}, ${hexToRgba(baseColor, 0.8)})`; // 3색 그라데이션

      case "intermediate":
        return `linear-gradient(135deg, #ffffff, ${baseColor}, #eeffff, ${hexToRgba(baseColor, 0.9)})`; // 복잡한 그라데이션

      case "skilled":
        return `linear-gradient(135deg, #ffffff, ${baseColor}, #ffffff, ${hexToRgba(baseColor, 0.9)}, ${baseColor})`; // 다중 그라데이션

      case "advanced":
        return `radial-gradient(circle at center, #ffffff 5%, ${baseColor} 20%, ${hexToRgba(baseColor, 0.7)} 70%)`; // 방사형 그라데이션

      case "expert":
        return `radial-gradient(circle at center, #ffffff 0%, ${baseColor} 30%, ${hexToRgba(baseColor, 0.8)} 60%, ${hexToRgba(baseColor, 0.5)} 90%)`; // 고급 방사형 그라데이션

      case "master":
        return `conic-gradient(from 0deg, ${baseColor}, ${hexToRgba(baseColor, 0.7)}, #ffffff, ${baseColor})`; // 원뿔형 그라데이션

      case "grandmaster":
        return `conic-gradient(from 45deg, #ffffff, ${baseColor}, #ffffff, ${hexToRgba(baseColor, 1)}, ${baseColor}, #ffffff)`; // 고급 원뿔형 그라데이션

      case "legendary":
        return `conic-gradient(from 0deg, #ffffff, ${baseColor}, #ffffff, ${hexToRgba(baseColor, 1)}, ${baseColor}, ${hexToRgba("#ffff00", 0.8)}, #ffffff, ${baseColor})`; // 복합 원뿔형 그라데이션
    }
  };

  // Enhanced star shape complexity based on tier
  const generateStarPoints = (
    points: number,
    innerRadiusRatio: number = 0.4,
    waveIntensity: number = 0, // 별 모양의 파동 강도
  ) => {
    let result = "";
    const outerRadius = 50;
    const innerRadius = outerRadius * innerRadiusRatio;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const isOuterPoint = i % 2 === 0;

      // 고급 티어에는 물결 모양 추가
      let radiusModifier = 1;
      if (waveIntensity > 0 && isOuterPoint) {
        radiusModifier = 1 + waveIntensity * Math.sin(i * 5) * 0.1;
      }

      const radius = isOuterPoint ? outerRadius * radiusModifier : innerRadius;
      const x = 50 + radius * Math.sin(angle);
      const y = 50 - radius * Math.cos(angle);
      result += `${x}% ${y}%${i < points * 2 - 1 ? ", " : ""}`;
    }

    return result;
  };

  // Points configuration based on 10 tiers
  const getStarProperties = () => {
    switch (tier) {
      case "novice":
        return { points: 4, innerRadius: 0.5, wave: 0 }; // 사각형
      case "beginner":
        return { points: 4, innerRadius: 0.4, wave: 0 }; // 약간 날카로운 사각형
      case "apprentice":
        return { points: 5, innerRadius: 0.5, wave: 0 }; // 일반 별
      case "intermediate":
        return { points: 5, innerRadius: 0.4, wave: 0 }; // 날카로운 별
      case "skilled":
        return { points: 6, innerRadius: 0.35, wave: 0 }; // 6점 별
      case "advanced":
        return { points: 7, innerRadius: 0.3, wave: 0 }; // 7점 별
      case "expert":
        return { points: 8, innerRadius: 0.25, wave: 0.5 }; // 8점 별 + 약간의 파동
      case "master":
        return { points: 10, innerRadius: 0.2, wave: 1.0 }; // 10점 별 + 파동
      case "grandmaster":
        return { points: 12, innerRadius: 0.15, wave: 1.5 }; // 12점 별 + 강한 파동
      case "legendary":
        return { points: 16, innerRadius: 0.1, wave: 2.0 }; // 16점 별 + 매우 강한 파동
    }
  };

  const starProps = getStarProperties();
  const clipPathValue = `polygon(${generateStarPoints(starProps.points, starProps.innerRadius, starProps.wave)})`;
  const size = starSize * (isHovered ? 1.5 : 1);

  // Enhanced rotation & animation based on tier
  const getRotationConfig = () => {
    const baseSeed = (star.docId?.charCodeAt(0) || 0) % 2 === 0 ? 1 : -1;

    switch (tier) {
      case "novice":
        return { speed: 3, direction: baseSeed }; // 매우 느린 회전
      case "beginner":
        return { speed: 5, direction: baseSeed }; // 느린 회전
      case "apprentice":
        return { speed: 8, direction: baseSeed }; // 약간 느린 회전
      case "intermediate":
        return { speed: 12, direction: baseSeed }; // 표준 회전
      case "skilled":
        return { speed: 18, direction: baseSeed }; // 약간 빠른 회전
      case "advanced":
        return { speed: 25, direction: baseSeed }; // 빠른 회전
      case "expert":
        return { speed: 35, direction: baseSeed }; // 매우 빠른 회전
      case "master":
        return { speed: 45, direction: baseSeed }; // 초고속 회전
      case "grandmaster":
        return { speed: 60, direction: baseSeed }; // 극도로 빠른 회전
      case "legendary":
        return { speed: 80, direction: baseSeed }; // 초월적 회전 속도
    }
  };

  const rotationConfig = getRotationConfig();

  // Add additional particle effects for higher tiers
  const renderParticles = () => {
    // apprentice 티어부터 파티클 추가
    if (["novice", "beginner"].includes(tier)) return null;

    const particleConfig: Record<
      string,
      { count: number; size: number; range: number; duration: number }
    > = {
      novice: { count: 0, size: 0, range: 0, duration: 0 },
      beginner: { count: 0, size: 0, range: 0, duration: 0 },
      apprentice: { count: 2, size: 0.2, range: 1.2, duration: 3 },
      intermediate: { count: 3, size: 0.25, range: 1.3, duration: 2.8 },
      skilled: { count: 4, size: 0.3, range: 1.4, duration: 2.6 },
      advanced: { count: 5, size: 0.3, range: 1.5, duration: 2.4 },
      expert: { count: 6, size: 0.35, range: 1.6, duration: 2.2 },
      master: { count: 8, size: 0.4, range: 1.7, duration: 2.0 },
      grandmaster: { count: 10, size: 0.45, range: 1.8, duration: 1.8 },
      legendary: { count: 12, size: 0.5, range: 2.0, duration: 1.5 },
    };

    const config = particleConfig[tier];

    return Array.from({ length: config.count }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${size * config.size}px`,
          height: `${size * config.size}px`,
          backgroundColor: baseColor,
          boxShadow: `0 0 ${glowSize / 3}px ${glowSize / 6}px ${glowColor}`,
          top: "50%",
          left: "50%",
        }}
        animate={{
          x: [0, Math.cos(i * (360 / config.count)) * size * config.range],
          y: [0, Math.sin(i * (360 / config.count)) * size * config.range],
          opacity: [1, 0.2, 1],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: config.duration + (i % 3),
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    ));
  };

  // 티어별 추가 효과 렌더링
  const renderTierEffects = () => {
    if (tier === "master" || tier === "grandmaster" || tier === "legendary") {
      // 마스터 티어 이상에서 추가 광채 효과
      return (
        <motion.div
          className="absolute inset-0"
          style={{
            width: `${size * 3}px`,
            height: `${size * 3}px`,
            borderRadius: "50%",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: -1,
          }}
          animate={{
            boxShadow: [
              `0 0 ${glowSize * 2}px ${glowSize}px ${hexToRgba(baseColor, 0.1)}`,
              `0 0 ${glowSize * 2}px ${glowSize * 1.5}px ${hexToRgba(baseColor, 0.3)}`,
              `0 0 ${glowSize * 2}px ${glowSize}px ${hexToRgba(baseColor, 0.1)}`,
            ],
          }}
          transition={{
            duration: tier === "legendary" ? 1 : 2,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      );
    }
    return null;
  };

  // 특별한 티어별 효과
  const renderSpecialEffects = () => {
    // 레전더리 티어에만 특별한 주변 오라 효과
    if (tier === "legendary") {
      return (
        <>
          <motion.div
            className="absolute"
            style={{
              position: "absolute",
              width: `${size * 4}px`,
              height: `${size * 4}px`,
              borderRadius: "50%",
              background: "transparent",
              left: "-90%",
              top: "-90%",
              transform: "translate(-50%, -50%)",
              zIndex: -2,
            }}
            animate={{
              boxShadow: [
                `0 0 ${glowSize}px ${glowSize / 2}px ${hexToRgba(baseColor, 0.1)}`,
                `0 0 ${glowSize * 2}px ${glowSize}px ${hexToRgba(baseColor, 0.2)}`,
                `0 0 ${glowSize}px ${glowSize / 2}px ${hexToRgba(baseColor, 0.1)}`,
              ],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
          <motion.div
            className="absolute"
            style={{
              position: "absolute",
              width: `${size * 2}px`,
              height: `${size * 2}px`,
              borderRadius: "50%",
              background: "transparent",
              left: "-20%",
              top: "-20%",
              transform: "translate(-50%, -50%)",
              zIndex: -1,
            }}
            animate={{
              boxShadow: [
                `0 0 0 0px ${hexToRgba(baseColor, 0)}`,
                `0 0 0 ${size / 1.5}px ${hexToRgba(baseColor, 0.3)}`,
                `0 0 0 ${size * 1.5}px ${hexToRgba(baseColor, 0)}`,
              ],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        </>
      );
    }

    // 그랜드마스터 티어에 특별한 효과
    if (tier === "grandmaster") {
      return (
        <motion.div
          className="absolute"
          style={{
            position: "absolute",
            width: `${size * 3}px`,
            height: `${size * 3}px`,
            borderRadius: "50%",
            background: "transparent",
            left: "-50%",
            top: "-50%",
            transform: "translate(-50%, -50%)",
            zIndex: -1,
          }}
          animate={{
            boxShadow: [
              `0 0 0 0px ${hexToRgba(baseColor, 0)}`,
              `0 0 0 ${size / 2}px ${hexToRgba(baseColor, 0.2)}`,
              `0 0 0 ${size}px ${hexToRgba(baseColor, 0)}`,
            ],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      );
    }

    return null;
  };

  return (
    <motion.div
      className="absolute cursor-pointer"
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
      {/* 특별 효과 렌더링 */}
      {renderSpecialEffects()}
      {renderTierEffects()}

      <motion.div
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
          clipPath: clipPathValue,
          backgroundImage: tier !== "novice" ? getGradient() : "none",
          backgroundColor: tier === "novice" ? starColor : "transparent",
          boxShadow: `0 0 ${glowSize}px ${glowSize / 2}px ${glowColor}`,
          transition: "all 0.3s ease",
        }}
        animate={{
          rotate: rotationConfig.direction * 360,
        }}
        transition={{
          duration: 60 / rotationConfig.speed,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
      />

      {/* Outer glow effect for higher tier badges */}
      {tier !== "novice" && tier !== "beginner" && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: "transparent",
            clipPath: clipPathValue,
            width: `${size}px`,
            height: `${size}px`,
          }}
          animate={{
            boxShadow: [
              `0 0 ${glowSize * 1.5}px ${glowSize}px rgba(255, 255, 255, 0)`,
              `0 0 ${glowSize * 1.5}px ${glowSize}px ${hexToRgba(baseColor, 0.3)}`,
              `0 0 ${glowSize * 1.5}px ${glowSize}px rgba(255, 255, 255, 0)`,
            ],
            scale: [1, 1.1, 1],
            rotate: rotationConfig.direction * -180, // Counter-rotation for interesting effect
          }}
          transition={{
            duration: 3 - sizeConfig[tier].intensity * 2, // 높은 티어일수록 더 빠른 애니메이션
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      )}

      {/* Particle effects for higher tier badges */}
      {renderParticles()}

      {isHovered && (
        <div className="absolute left-1/2 top-full -translate-x-1/2 mt-1 text-xs text-white whitespace-nowrap bg-black/50 px-2 py-0.5 rounded">
          {star.id} ({star.job}) - {getBadgeTierKo(userBadgeCount)}
        </div>
      )}
    </motion.div>
  );
}
