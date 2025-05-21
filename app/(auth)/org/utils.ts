import { User } from "next-auth";
import { StarTier, UserStar } from "@/app/(auth)/org/internal";

// Badge-based scaling - 10단계로 확장
export const getBadgeTier = (userBadgeCount: number) => {
  if (userBadgeCount === 0) return "novice";
  if (userBadgeCount <= 3) return "beginner";
  if (userBadgeCount <= 7) return "apprentice";
  if (userBadgeCount <= 15) return "intermediate";
  if (userBadgeCount <= 30) return "skilled";
  if (userBadgeCount <= 45) return "advanced";
  if (userBadgeCount <= 60) return "expert";
  if (userBadgeCount <= 80) return "master";
  if (userBadgeCount <= 100) return "grandmaster";
  return "legendary";
};

export const getBadgeTierKo = (userBadgeCount: number) => {
  if (userBadgeCount === 0) return "우주먼지(novice)";
  if (userBadgeCount <= 3) return "소성(beginner)";
  if (userBadgeCount <= 7) return "혜성(apprentice)";
  if (userBadgeCount <= 15) return "항성(intermediate)";
  if (userBadgeCount <= 30) return "중성자별(sklilled)";
  if (userBadgeCount <= 45) return "거성(advanced)";
  if (userBadgeCount <= 60) return "초신성(expert)";
  if (userBadgeCount <= 80) return "펄서(master)";
  if (userBadgeCount <= 100) return "쿼사(grandmaster)";
  return "은하(legendary)";
};

export const getStarBaseColor = (tier: StarTier, star: UserStar) => {
  switch (tier) {
    case "novice":
      return star.color || "#aaaaaa"; // 회색
    case "beginner":
      return star.color || "#cccccc"; // 밝은 회색
    case "apprentice":
      return star.color || "#ffffff"; // 흰색
    case "intermediate":
      return star.color || "#a0e6ff"; // 하늘색
    case "skilled":
      return star.color || "#00ffff"; // 청록색
    case "advanced":
      return star.color || "#ffcc00"; // 금색
    case "expert":
      return star.color || "#ff9500"; // 주황색
    case "master":
      return star.color || "#ff00ff"; // 마젠타
    case "grandmaster":
      return star.color || "#aa00ff"; // 보라색
    case "legendary":
      return star.color || "#ff0000"; // 붉은색
  }
};
