import { BadgeResponse } from "@/app/(auth)/hub/api";

export const getBadgeDifficultyColorClassName = (
  badge: BadgeResponse,
): string => {
  switch (badge.difficultyLevel) {
    case "쉬움":
      return "bg-green-500";
    case "보통":
      return "bg-blue-500";
    case "어려움":
      return "bg-orange-500";
    case "매우 어려움":
      return "bg-red-500";
    default:
      return "bg-gray-500"; // Default color for undefined levels
  }
};
