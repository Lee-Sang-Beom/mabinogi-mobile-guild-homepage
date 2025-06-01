import { Shield, Sparkles, Users } from "lucide-react";
import type { Character } from "../internal";

export const CHARACTERS: Character[] = [
  {
    id: 1,
    name: "마법사",
    hp: 100,
    speed: 3,
    startWeapon: "magicWand", // 투사체 무기
    color: "#4A90E2",
    icon: Sparkles,
  },
  {
    id: 2,
    name: "전사",
    hp: 150,
    speed: 2,
    startWeapon: "whip", // 근접 무기 (원형 공격)
    color: "#E74C3C",
    icon: Shield,
  },
  {
    id: 3,
    name: "궁수",
    hp: 80,
    speed: 4,
    startWeapon: "bow", // 빠른 투사체 무기
    color: "#27AE60",
    icon: Users,
  },
];
