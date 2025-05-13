"use client";

import { BadgeResponse } from "@/app/(auth)/hub/api";
import { getBadgeDifficultyColorClassName } from "@/shared/utils/badge-utils";
import Image from "next/image";
import { useState } from "react";

interface BadgeCardProps {
  badge: BadgeResponse;
  isSelected: boolean;
  onClickAction: () => void;
}

export function BadgeCard({
  badge,
  isSelected,
  onClickAction,
}: BadgeCardProps) {
  const [imgSrc, setImgSrc] = useState(
    badge.imgName && badge.imgName.trim() !== ""
      ? `/images/badges/${badge.imgName}`
      : "/images/favicon-mabinogi-mobile.png",
  );

  return (
    <div
      onClick={onClickAction}
      className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-amber-500 border-amber-500"
          : "hover:shadow-lg border border-gray-200 dark:border-gray-700"
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white">
          ✓
        </div>
      )}
      <div className="flex flex-col items-center">
        <Image
          src={imgSrc}
          alt={badge.badge.name}
          width={60}
          height={60}
          className="rounded-full mb-3"
          onError={() => setImgSrc("/images/favicon-mabinogi-mobile.png")}
        />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 text-center">
          {badge.badge.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center line-clamp-2">
          {badge.badge.description}
        </p>
        <div
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getBadgeDifficultyColorClassName(
            badge,
          )}`}
        >
          {badge.difficultyLevel}
        </div>
      </div>
    </div>
  );
}
