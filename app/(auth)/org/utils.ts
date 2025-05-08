import { User } from "next-auth";

export function getUserStarSize(user: User) {
  // 차후에 길드 영향력 (이벤트 뱃지 수)에 따라 사이즈를 다르게줄거임!!
  const size = 7 + Math.random() * 2;
  if (!user) return size;

  if (user.role === "GUILD_MASTER") {
  } else if (user.role === "GUILD_SUB_MASTER") {
  } else {
  }

  return size;
}
