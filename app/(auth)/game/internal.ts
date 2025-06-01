import { User } from "next-auth";

export type GameKindType = "snake" | "vampire" | "super_hexagon"; // 게임종류
export interface GameProps {
  user: User;
}
