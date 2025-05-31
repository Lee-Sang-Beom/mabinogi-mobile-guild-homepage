import {
  Bot,
  Crown,
  Flame,
  Shield,
  Skull,
  Snowflake,
  Sparkles,
  Sword,
  Users,
  Zap,
  Target,
  Crosshair,
  ShieldCheck,
  Wind,
  Bomb,
  Axe,
  Star,
  Tornado,
  Heart,
  Eclipse,
  Feather,
  Ghost,
  Hammer,
} from "lucide-react";

// 게임 설정
export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PLAYER_SIZE: 20,
  ENEMY_SIZE: 15,
  BULLET_SIZE: 5,
  PLAYER_SPEED: 3,
  ENEMY_SPEED: 1,
  BULLET_SPEED: 8,
  GAME_DURATION: 10 * 60 * 1000, // 10분
  EXP_ORB_SIZE: 8,
};

// 캐릭터 데이터
export const CHARACTERS = [
  {
    id: 1,
    name: "마법사",
    hp: 100,
    speed: 3,
    startWeapon: "fireball" as const,
    color: "#4A90E2",
    icon: Sparkles,
  },
  {
    id: 2,
    name: "전사",
    hp: 150,
    speed: 2,
    startWeapon: "sword" as const,
    color: "#E74C3C",
    icon: Shield,
  },
  {
    id: 3,
    name: "궁수",
    hp: 80,
    speed: 4,
    startWeapon: "arrow" as const,
    color: "#27AE60",
    icon: Users,
  },
];

// 무기 데이터
export const WEAPONS = {
  // 기존 무기들
  fireball: {
    name: "파이어볼",
    damage: 20,
    cooldown: 1200,
    color: "#FF6B35",
    range: 150,
    type: "projectile" as const,
    explosionRadius: 120,
    explosionDamage: 5,
    icon: Flame,
  },
  sword: {
    name: "검",
    damage: 40,
    cooldown: 800,
    color: "#C0C0C0",
    range: 60,
    type: "melee" as const,
    icon: Sword,
  },
  arrow: {
    name: "화살",
    damage: 35,
    cooldown: 800,
    color: "#e81189",
    range: 200,
    type: "multi" as const,
    projectileCount: 3,
    spread: 15,
    icon: Users,
  },
  lightning: {
    name: "번개",
    damage: 25,
    cooldown: 1200,
    color: "#FFD700",
    range: 180,
    type: "chain" as const,
    chainRange: 80,
    chainDamage: 15,
    maxChains: 3,
    icon: Zap,
  },
  ice: {
    name: "얼음",
    damage: 30,
    cooldown: 1000,
    color: "#87CEEB",
    range: 120,
    type: "projectile" as const,
    slowEffect: 0.6,
    slowDuration: 2000,
    icon: Snowflake,
  },

  crossbow: {
    name: "석궁",
    damage: 80,
    cooldown: 2000,
    color: "#f87f08",
    range: 500,
    type: "projectile" as const,
    piercing: 10, // 관통 횟수
    icon: Crosshair,
  },
  shield: {
    name: "방패",
    damage: 20,
    cooldown: 800,
    color: "#4f4f5a",
    range: 60,
    type: "defensive" as const,
    knockback: 400,
    block: 0.3, // 30% 데미지 감소
    icon: ShieldCheck,
  },
  whirlwind: {
    name: "회오리바람",
    damage: 15,
    cooldown: 3000,
    color: "#00b3ff",
    range: 100,
    type: "area" as const,
    duration: 1500,
    pullForce: 3, // 적을 끌어당기는 힘
    icon: Wind,
  },
  bomb: {
    name: "폭탄",
    damage: 100,
    cooldown: 3000,
    color: "#FF4500",
    range: 120,
    type: "explosive" as const,
    explosionRadius: 100,
    explosionDamage: 60,
    delay: 2000, // 폭발 지연시간
    icon: Bomb,
  },
  axe: {
    name: "도끼",
    damage: 40,
    cooldown: 1000,
    color: "#753000",
    range: 90,
    type: "melee" as const,
    cleave: true, // 범위 공격
    cleaveAngle: 60, // 도 단위
    icon: Axe,
  },
  shuriken: {
    name: "수리검",
    damage: 25,
    cooldown: 1000,
    color: "#67ffa8",
    range: 180,
    type: "multi" as const,
    projectileCount: 4,
    spread: 30, // 각도 분산
    icon: Star,
  },
  laser: {
    name: "레이저",
    damage: 40,
    cooldown: 1800,
    color: "#eefb00",
    range: 1000,
    type: "beam" as const,
    beamWidth: 80,
    chargeTime: 1000,
    icon: Target,
  },

  // 새로 추가된 무기들
  shadowbolt: {
    name: "흡혈 화살",
    damage: 35,
    cooldown: 900,
    color: "#dbdbdb",
    range: 220,
    type: "homing" as const,
    homingStrength: 0.3, // 유도 강도
    lifeSteal: 0.01, // 1% 생명력 흡수
    icon: Eclipse,
  },
  feather: {
    name: "깃털날개",
    damage: 20,
    cooldown: 500,
    color: "#FFE4E1",
    range: 160,
    type: "scatter" as const,
    projectileCount: 6,
    spreadAngle: 360, // 전방향 발사
    floatingTime: 2000, // 공중에 떠있는 시간
    icon: Feather,
  },
};

// 적 유형
export const ENEMY_TYPES = [
  {
    type: "zombie" as const,
    hp: 120,
    speed: 0.8,
    color: "#8B4513",
    exp: 1,
    size: 15,
    icon: Bot,
  },
  {
    type: "skeleton" as const,
    hp: 200,
    speed: 1,
    color: "#F5F5DC",
    exp: 2,
    size: 12,
    icon: Skull,
  },
  {
    type: "orc" as const,
    hp: 300,
    speed: 0.7,
    color: "#228B22",
    exp: 5,
    size: 18,
    icon: Users,
  },
  {
    type: "demon" as const,
    hp: 500,
    speed: 0.9,
    color: "#8B0000",
    exp: 7,
    size: 20,
    icon: Crown,
  },
  {
    type: "golem" as const,
    hp: 1500,
    speed: 0.6,
    color: "#A9A9A9",
    exp: 20,
    size: 25,
    icon: Shield, // 체력이 높고 느림
  },
  {
    type: "vampire" as const,
    hp: 700,
    speed: 1.5,
    color: "#800080",
    exp: 10,
    size: 17,
    icon: Heart, // 빠르고 회피형 (추후 특성 구현 가능)
  },
  {
    type: "mage" as const,
    hp: 1000,
    speed: 0.9,
    color: "#1E90FF",
    exp: 10,
    size: 16,
    icon: Sparkles,
  },
];
