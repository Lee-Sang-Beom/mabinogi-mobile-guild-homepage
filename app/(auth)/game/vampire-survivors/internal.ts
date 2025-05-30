import { WEAPONS } from "@/app/(auth)/game/vampire-survivors/data";

// 타입 정의
export type WeaponType = keyof typeof WEAPONS;

export interface Player {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  level: number;
  exp: number;
  expToNext: number;
  weapons: WeaponType[];
  passives: string[];
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  type: string;
  hp: number;
  maxHp: number;
  speed: number;
  color: string;
  exp: number;
  size: number;
  slowEffect?: number;
  slowEndTime?: number;
}

// internal.ts 파일에 추가
export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  range: number;
  traveled: number;
  weaponType: WeaponType;
  targetId: number;
  // 새로 추가된 필드들
  targetX?: number;
  targetY?: number;
  delay?: number;
  startTime?: number;
  piercing?: number; // crossbow용
}

export interface ExpOrb {
  id: number;
  x: number;
  y: number;
  exp: number;
}

export interface Effect {
  id: number;
  type: string;
  x: number;
  y: number;
  duration: number;
  startTime: number;
  [key: string]: any;
}
