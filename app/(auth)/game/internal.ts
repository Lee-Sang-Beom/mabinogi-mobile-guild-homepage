import { User } from "next-auth";

export type GameKindType = "snake" | "vampire" | "brick"; // 게임종류
export interface GameProps {
  user: User;
}
