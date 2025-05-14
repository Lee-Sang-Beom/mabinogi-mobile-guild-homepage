"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { hexToRgba } from "@/shared/utils/utils";
import type { UserStar } from "@/app/(auth)/org/internal";

interface StarProps {
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

  // Badge-based scaling - DRAMATICALLY ENHANCED
  const getBadgeTier = () => {
    if (userBadgeCount === 0) return "novice";
    if (userBadgeCount <= 2) return "beginner";
    if (userBadgeCount <= 5) return "intermediate";
    if (userBadgeCount <= 8) return "advanced";
    if (userBadgeCount <= 12) return "expert";
    return "legendary";
  };

  const tier = getBadgeTier();

  // Size configuration based on tiers
  const sizeConfig = {
    novice: { size: 10, glow: 5, intensity: 0.2 },
    beginner: { size: 15, glow: 15, intensity: 0.4 },
    intermediate: { size: 20, glow: 25, intensity: 0.6 },
    advanced: { size: 25, glow: 40, intensity: 0.8 },
    expert: { size: 30, glow: 60, intensity: 0.9 },
    legendary: { size: 40, glow: 80, intensity: 1.0 },
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

  // Parallax effect
  const parallaxX = (mousePosition.x - window.innerWidth / 2) * 0.01;
  const parallaxY = (mousePosition.y - window.innerHeight / 2) * 0.01;

  // Enhanced star color and glow based on badge tier
  const getStarBaseColor = () => {
    switch (tier) {
      case "novice":
        return star.color || "#cccccc"; // Dim gray
      case "beginner":
        return star.color || "#ffffff"; // White
      case "intermediate":
        return star.color || "#00ffff"; // Cyan
      case "advanced":
        return star.color || "#ffcc00"; // Gold
      case "expert":
        return star.color || "#ff00ff"; // Magenta
      case "legendary":
        return star.color || "#ff0000"; // Red
    }
  };

  const baseColor = getStarBaseColor();
  const starColor = hexToRgba(baseColor, Math.min(0.8, 0.5 + glowIntensity));
  const glowColor = hexToRgba(baseColor, glowIntensity);

  // Enhanced gradient effect based on badge tiers
  const getGradient = () => {
    switch (tier) {
      case "novice":
        return `${baseColor}`; // Simple solid color

      case "beginner":
        return `linear-gradient(135deg, #ffffff, ${baseColor}, ${hexToRgba(baseColor, 0.8)})`; // Simple gradient

      case "intermediate":
        return `linear-gradient(135deg, #ffffff, ${baseColor}, #ffffff, ${hexToRgba(baseColor, 0.9)}, ${baseColor})`; // More complex

      case "advanced":
        return `linear-gradient(135deg, #ffffff, ${baseColor}, #ffffff, ${hexToRgba(baseColor, 1)}, ${baseColor}, #ffffff)`; // Vibrant

      case "expert":
        // Radial gradient for an energetic glow effect
        return `radial-gradient(circle at center, #ffffff 0%, ${baseColor} 30%, ${hexToRgba(baseColor, 0.8)} 70%, ${hexToRgba(baseColor, 0.5)} 100%)`;

      case "legendary":
        // Complex animated-looking gradient
        return `conic-gradient(from 0deg, #ffffff, ${baseColor}, #ffffff, ${hexToRgba(baseColor, 1)}, ${baseColor}, #ffffff, ${baseColor}, #ffffff)`;
    }
  };

  // Enhanced star shape complexity based on tier
  const generateStarPoints = (
    points: number,
    innerRadiusRatio: number = 0.4,
  ) => {
    let result = "";
    const outerRadius = 50;
    const innerRadius = outerRadius * innerRadiusRatio;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = 50 + radius * Math.sin(angle);
      const y = 50 - radius * Math.cos(angle);
      result += `${x}% ${y}%${i < points * 2 - 1 ? ", " : ""}`;
    }

    return result;
  };

  // Points configuration based on tiers
  const getStarProperties = () => {
    switch (tier) {
      case "novice":
        return { points: 4, innerRadius: 0.5 }; // Simple square-like shape
      case "beginner":
        return { points: 5, innerRadius: 0.4 }; // Classic 5-point star
      case "intermediate":
        return { points: 6, innerRadius: 0.3 }; // 6-point star
      case "advanced":
        return { points: 8, innerRadius: 0.25 }; // 8-point star
      case "expert":
        return { points: 10, innerRadius: 0.2 }; // 10-point star
      case "legendary":
        return { points: 12, innerRadius: 0.15 }; // 12-point star with sharp points
    }
  };

  const starProps = getStarProperties();
  const clipPathValue = `polygon(${generateStarPoints(starProps.points, starProps.innerRadius)})`;
  const size = starSize * (isHovered ? 1.5 : 1);

  // Enhanced rotation & animation based on tier
  const getRotationConfig = () => {
    const baseSeed = (star.docId?.charCodeAt(0) || 0) % 2 === 0 ? 1 : -1;

    switch (tier) {
      case "novice":
        return { speed: 5, direction: baseSeed }; // Slow rotation
      case "beginner":
        return { speed: 10, direction: baseSeed }; // Standard rotation
      case "intermediate":
        return { speed: 20, direction: baseSeed }; // Faster rotation
      case "advanced":
        return { speed: 30, direction: baseSeed }; // Very fast rotation
      case "expert":
        return { speed: 40, direction: baseSeed }; // Super fast rotation
      case "legendary":
        return { speed: 50, direction: baseSeed }; // Extreme rotation
    }
  };

  const rotationConfig = getRotationConfig();

  // Add additional particle effects for higher tiers
  const renderParticles = () => {
    if (tier === "novice" || tier === "beginner") return null;

    const particleCount =
      {
        intermediate: 2,
        advanced: 4,
        expert: 6,
        legendary: 8,
      }[tier] || 0;

    return Array.from({ length: particleCount }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${size / 4}px`,
          height: `${size / 4}px`,
          backgroundColor: baseColor,
          boxShadow: `0 0 ${glowSize / 3}px ${glowSize / 6}px ${glowColor}`,
          top: "50%",
          left: "50%",
        }}
        animate={{
          x: [0, Math.cos(i * (360 / particleCount)) * size],
          y: [0, Math.sin(i * (360 / particleCount)) * size],
          opacity: [1, 0.2, 1],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 2 + (i % 3),
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    ));
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
            duration: tier === "legendary" ? 1 : 2,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      )}

      {/* Particle effects for higher tier badges */}
      {renderParticles()}

      {/* Special legendary pulse effect */}
      {tier === "legendary" && (
        <motion.div
          className="absolute"
          style={{
            position: "absolute",
            width: `${size * 2}px`,
            height: `${size * 2}px`,
            borderRadius: "50%",
            background: "transparent",
            left: "-60%",
            top: "-60%",
            transform: "translate(-50%, -50%)",
            transformOrigin: "center",
            marginLeft: "50%",
            marginTop: "50%",
          }}
          animate={{
            boxShadow: [
              `0 0 0 0px ${hexToRgba(baseColor, 0)}`,
              `0 0 0 ${size / 2}px ${hexToRgba(baseColor, 0.2)}`,
              `0 0 0 ${size}px ${hexToRgba(baseColor, 0)}`,
            ],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      )}

      {isHovered && (
        <div className="absolute left-1/2 top-full -translate-x-1/2 mt-1 text-xs text-white whitespace-nowrap bg-black/50 px-2 py-0.5 rounded">
          {star.id} ({star.job})
        </div>
      )}
    </motion.div>
  );
}
