import {
  Beef,
  BookOpen,
  Copy,
  CandlestickChartIcon as Candle,
  Watch,
  Sparkles,
  Clover,
  Heart,
  Magnet,
  Crown,
} from "lucide-react";
import type { PassiveData, PassiveId } from "../internal";

export const PASSIVES: Record<PassiveId, PassiveData> = {
  spinach: {
    name: "시금치",
    description: "공격력을 증가시킵니다",
    icon: Beef,
    color: "#228B22",
    maxLevel: 5,
    effects: {
      damageMultiplier: [1.1, 1.2, 1.3, 1.4, 1.5],
    },
  },
  emptyTome: {
    name: "빈 서적",
    description: "투사체 개수를 증가시킵니다",
    icon: BookOpen,
    color: "#8B4513",
    maxLevel: 5,
    effects: {
      projectileCount: [1, 1, 2, 2, 3],
    },
  },
  duplicator: {
    name: "복제기",
    description: "투사체를 복제합니다",
    icon: Copy,
    color: "#4169E1",
    maxLevel: 5,
    effects: {
      duplicateChance: [0.1, 0.15, 0.2, 0.25, 0.3],
    },
  },
  candelabrador: {
    name: "촛대",
    description: "공격 범위를 증가시킵니다",
    icon: Candle,
    color: "#FFD700",
    maxLevel: 5,
    effects: {
      rangeMultiplier: [1.1, 1.2, 1.3, 1.4, 1.5],
    },
  },
  bracer: {
    name: "팔찌",
    description: "공격 속도를 증가시킵니다",
    icon: Watch,
    color: "#C0C0C0",
    maxLevel: 5,
    effects: {
      cooldownReduction: [0.1, 0.15, 0.2, 0.25, 0.3],
    },
  },
  spellbinder: {
    name: "주문서",
    description: "지속시간을 증가시킵니다",
    icon: Sparkles,
    color: "#9370DB",
    maxLevel: 5,
    effects: {
      durationMultiplier: [1.1, 1.2, 1.3, 1.4, 1.5],
    },
  },
  clover: {
    name: "클로버",
    description: "행운을 증가시킵니다",
    icon: Clover,
    color: "#32CD32",
    maxLevel: 5,
    effects: {
      luck: [0.1, 0.15, 0.2, 0.25, 0.3],
    },
  },
  pummarola: {
    name: "토마토",
    description: "체력 회복량을 증가시킵니다",
    icon: Heart,
    color: "#FF6347",
    maxLevel: 5,
    effects: {
      healthRegen: [0.5, 1, 1.5, 2, 2.5],
    },
  },
  attractorb: {
    name: "자석구",
    description: "경험치 수집 범위를 증가시킵니다",
    icon: Magnet,
    color: "#FF1493",
    maxLevel: 5,
    effects: {
      magnetRange: [1.2, 1.4, 1.6, 1.8, 2.0],
    },
  },
  crown: {
    name: "왕관",
    description: "경험치 획득량을 증가시킵니다",
    icon: Crown,
    color: "#FFD700",
    maxLevel: 5,
    effects: {
      expMultiplier: [1.1, 1.2, 1.3, 1.4, 1.5],
    },
  },
};
