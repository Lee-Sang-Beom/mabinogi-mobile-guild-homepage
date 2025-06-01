import type { LucideIcon } from "lucide-react";

export interface Character {
  id: number;
  name: string;
  hp: number;
  speed: number;
  startWeapon: WeaponId;
  color: string;
  icon: LucideIcon;
}

export interface Player {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  level: number;
  exp: number;
  expToNext: number;
  weapons: PlayerWeapon[];
  passives: PlayerPassive[];
  invulnerableUntil: number;
  speed: number;
  weaponSlots: number;
  passiveSlots: number;
}

export interface PlayerWeapon {
  id: WeaponId;
  level: number;
  lastAttack: number;
}

export interface PlayerPassive {
  id: PassiveId;
  level: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  color: string;
  exp: number;
  size: number;
  slowEffect?: number;
  slowEndTime?: number;
  stunEndTime?: number;
  isBoss?: boolean;
}

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
  weaponId: WeaponId;
  weaponLevel: number;
  targetId?: number;
  targetX?: number;
  targetY?: number;
  delay?: number;
  startTime?: number;
  piercing?: number;
  homingStrength?: number;
  lifeSteal?: number;
  floatingTime?: number;
  bounces?: number;
  maxBounces?: number;
}

export interface ExpOrb {
  id: number;
  x: number;
  y: number;
  exp: number;
  magnetized?: boolean;
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

export interface WeaponData {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  type: WeaponType;
  baseDamage: number;
  baseCooldown: number;
  baseRange: number;
  maxLevel: number;
  levelScaling: {
    damage: number;
    cooldown: number;
    range?: number;
    projectileCount?: number;
    [key: string]: any;
  };
  special?: {
    [key: string]: any;
  };
}

export interface PassiveData {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  maxLevel: number;
  effects: {
    [key: string]: number[];
  };
}

export interface EnemyData {
  name: string;
  hp: number;
  speed: number;
  color: string;
  exp: number;
  size: number;
  icon: LucideIcon;
  isBoss?: boolean;
  spawnWeight: number;
  minWave: number;
}

export interface LevelUpOption {
  type: "weapon" | "passive" | "evolution";
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  currentLevel?: number;
  maxLevel?: number;
  isNew?: boolean;
}

export interface GameRankingData {
  success: boolean;
  data: Array<{
    docId: string;
    userId: string;
    score: number;
    regDt: string;
    rank: number;
  }>;
}

export type WeaponType =
  | "projectile"
  | "melee"
  | "area"
  | "orbital"
  | "beam"
  | "multi";
export type EnemyType =
  | "zombie"
  | "skeleton"
  | "bat"
  | "ghost"
  | "orc"
  | "demon"
  | "reaper"
  | "dragon";
export type WeaponId =
  | "whip"
  | "magicWand"
  | "axe"
  | "bow"
  | "knife"
  | "cross"
  | "kingBible"
  | "fireWand"
  | "santaWater"
  | "runetracer"
  | "lightningRing";
export type PassiveId =
  | "spinach"
  | "emptyTome"
  | "candelabrador"
  | "bracer"
  | "pummarola"
  | "attractorb"
  | "crown";

export interface GameState {
  state: "menu" | "playing" | "paused" | "levelup" | "gameover";
  gameTime: number;
  score: number;
  wave: number;
  enemiesKilled: number;
  highScore: number;
  isGameOverProcessed: boolean;
}
