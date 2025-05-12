"use client";

import { BadgeResponse } from "@/app/(auth)/hub/api";
import { getBadgeDifficultyColorClassName } from "@/shared/utils/badge-utils";

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
        <div className="w-16 h-16 mb-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl">
          {badge.imgName.charAt(0).toUpperCase()}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-1">
          {badge.badge.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3 line-clamp-2">
          {badge.badge.description}
        </p>
        <div
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getBadgeDifficultyColorClassName(badge)}`}
        >
          {badge.difficultyLevel}
        </div>
      </div>
    </div>
  );
}
