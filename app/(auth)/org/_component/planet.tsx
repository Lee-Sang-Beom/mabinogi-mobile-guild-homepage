"use client";

import { hexToRgba } from "@/shared/utils/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { RenderedPlanet } from "@/app/(auth)/org/internal";

interface PlanetProps {
  planet: RenderedPlanet;
  mousePosition: { x: number; y: number };
}

export function Planet({ planet, mousePosition }: PlanetProps) {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 행성 회전 애니메이션
  useEffect(() => {
    const animate = () => {
      setRotation((prev) => (prev + planet.rotationSpeed) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [planet.rotationSpeed]);

  // 행성 텍스처 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = planet.size;
    canvas.width = size;
    canvas.height = size;

    // 행성 기본 색상 - HEX를 RGBA로 변환
    const baseColor = hexToRgba(planet.color, 0.9);
    const edgeColor = hexToRgba(planet.color, 0.7);

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, edgeColor);

    // 행성 그리기
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 행성 표면 텍스처 추가
    const craterCount = Math.floor(size / 10);
    for (let i = 0; i < craterCount; i++) {
      const craterSize = 2 + Math.random() * (size / 10);
      const x = Math.random() * size;
      const y = Math.random() * size;

      // 행성 경계 내에 있는지 확인
      const distFromCenter = Math.sqrt(
        Math.pow(x - size / 2, 2) + Math.pow(y - size / 2, 2),
      );
      if (distFromCenter + craterSize < size / 2) {
        ctx.beginPath();
        ctx.arc(x, y, craterSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.2})`;
        ctx.fill();
      }
    }

    // 행성 표면 하이라이트
    ctx.beginPath();
    ctx.arc(size / 4, size / 4, size / 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;
    ctx.fill();
  }, [planet.size, planet.color]);

  // 마우스 위치에 따른 시차 효과 계산
  const parallaxX = (mousePosition.x - window.innerWidth / 2) * 0.02;
  const parallaxY = (mousePosition.y - window.innerHeight / 2) * 0.02;

  return (
    <motion.div
      className="absolute"
      style={{
        left: planet.x,
        top: planet.y,
        transform: `translate(-50%, -50%) translate(${parallaxX}px, ${parallaxY}px)`,
        zIndex: 5,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: [1, 1.08, 1], // scale 애니메이션 추가: 커졌다가 작아짐
      }}
      transition={{ duration: 2 }}
    >
      {/* 행성 링 */}
      {planet.hasRings && (
        <div
          className="absolute rounded-full"
          style={{
            width: `${planet.size * 2}px`,
            height: `${planet.size * 0.5}px`,
            border: `2px solid ${planet.ringColor}`,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) rotateX(75deg) rotate(${rotation}deg)`,
            boxShadow: `0 0 10px 2px ${planet.ringColor}`,
          }}
        />
      )}

      {/* 행성 본체 */}
      <div
        className="rounded-full relative overflow-hidden"
        style={{
          width: `${planet.size}px`,
          height: `${planet.size}px`,
        }}
      >
        {/* 행성 텍스처 캔버스 */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full rounded-full"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </div>

      {/* 행성 이름 */}
      <div className="absolute left-1/2 top-full -translate-x-1/2 mt-2 text-xs text-white opacity-70 whitespace-nowrap">
        {planet.name}
      </div>
    </motion.div>
  );
}
