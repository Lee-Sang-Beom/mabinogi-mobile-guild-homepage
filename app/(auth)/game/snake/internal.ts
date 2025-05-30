// 타입 정의
import { GAME_STATES } from "@/app/(auth)/game/snake/data";

export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  x: number;
  y: number;
}

export type GameState = (typeof GAME_STATES)[keyof typeof GAME_STATES];
