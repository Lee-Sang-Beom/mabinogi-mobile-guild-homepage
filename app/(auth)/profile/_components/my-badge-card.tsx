"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BadgeResponse } from "@/app/(auth)/hub/api";
import { BadgeImage } from "@/app/(auth)/hub/_components/badges/badge-image";
import { getBadgeDifficultyColorClassName } from "@/shared/utils/badge-utils";

interface MyBadgeCardProps {
  badge: BadgeResponse;
  onClickAction: (badge: BadgeResponse) => void;
}

export function MyBadgeCard({ badge, onClickAction }: MyBadgeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative cursor-pointer bg-background/80 backdrop-blur-sm border border-primary/10 rounded-lg overflow-hidden shadow-md transition-all duration-300"
      whileHover={{
        y: -8,
        scale: 1.05,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      onClick={() => onClickAction(badge)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        <BadgeImage badge={badge} isHovered={isHovered} />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-80" : "opacity-60"}`}
        />
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 p-4 text-white"
        initial={{ y: 10, opacity: 0.8 }}
        animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="font-bold text-md mb-1">{badge.badge.name}</h3>
        <div className="flex items-center">
          <span
            className={`
            text-xs px-2 py-1 rounded-full ${getBadgeDifficultyColorClassName(badge)}
          `}
          >
            {badge.difficultyLevel}
          </span>
        </div>
      </motion.div>

      {/* 빛나는 효과 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/30 to-amber-500/0"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{
          opacity: isHovered ? 0.5 : 0,
          rotate: isHovered ? 45 : 0,
          scale: isHovered ? 1.2 : 1,
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}
