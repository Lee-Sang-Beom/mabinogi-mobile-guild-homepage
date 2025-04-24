import type React from 'react'
import {
  ArrowUpRight,
  Axe,
  Cross,
  Crosshair,
  Drum,
  Flame,
  Heart,
  Mic,
  Music,
  MusicIcon,
  NotebookIcon as Lotus,
  RibbonIcon as BowIcon,
  ShieldQuestion,
  Snowflake,
  Sparkles,
  Sword,
  Swords,
  Target,
  Wand,
  Scissors,  // 대체 아이콘: 단검 (Knife)
  Hand,       // 대체 아이콘: 격투가 (Fist)
  Slash,      // 듀얼블레이드
} from 'lucide-react'
import { jobTypeOptions } from '@/shared/constants/game'

// Define icon mapping type
type IconMap = Record<string, React.ElementType>

// Define the icon mapping for each job type
const iconMap: IconMap = {
  '전사': Axe,
  '대검전사': Sword,
  '검술사': Slash,
  '궁수': BowIcon,
  '석궁사수': Crosshair,
  '장궁병': Target,
  '마법사': Wand,
  '화염술사': Flame,
  '빙결술사': Snowflake,
  '힐러': Heart,
  '사제': Cross,
  '수도사': Lotus,
  '음유시인': Music,
  '댄서': Mic,
  '악사': Drum,
  '견습 전사': ShieldQuestion,
  '견습 궁수': ArrowUpRight,
  '견습 마법사': Sparkles,
  '견습 음유시인': MusicIcon,
  '견습 도적': Scissors,
  '도적': Scissors,
  '격투가': Hand,
  '듀얼블레이드': Swords,
}

// Create JobClassIcons based on jobTypeOptions
export const JobClassIcons: Record<string, React.ElementType> = jobTypeOptions.reduce<
  Record<string, React.ElementType>
>((acc, jobType) => {
  acc[jobType.value] = iconMap[jobType.value] || Sword // Default to Sword if no icon is found
  return acc
}, {})

// Define job class color mappings
const jobClassColorMap: { [key: string]: string } = {
  warrior: 'rgba(239, 68, 68, 0.8)', // Red
  archer: 'rgba(34, 197, 94, 0.8)', // Green
  mage: 'rgba(59, 130, 246, 0.8)', // Blue
  healer: 'rgba(245, 158, 11, 0.8)', // Amber
  bard: 'rgba(168, 85, 247, 0.8)', // Purple
  rouge: 'rgba(44, 62, 80, 0.8)', // Dark Gray
}

// Keywords that map to job class categories
const jobClassKeywordMap: { [keyword: string]: keyof typeof jobClassColorMap } = {
  '전사': 'warrior',
  '검술': 'warrior',
  '궁수': 'archer',
  '석궁': 'archer',
  '장궁': 'archer',
  '마법': 'mage',
  '술사': 'mage',
  '힐러': 'healer',
  '사제': 'healer',
  '수도': 'healer',
  '음유': 'bard',
  '댄서': 'bard',
  '악사': 'bard',
  '도적': 'rouge',
  '격투': 'rouge',
  '듀얼': 'rouge'
}

/**
 * Get job class color based on job class name
 * @param jobClass The job class name
 * @returns The color for the job class
 */
export const getJobClassColor = (jobClass: string): string => {
  for (const keyword in jobClassKeywordMap) {
    if (jobClass.includes(keyword)) {
      const mappedKey = jobClassKeywordMap[keyword]
      return jobClassColorMap[mappedKey]
    }
  }
  return 'rgba(148, 163, 184, 0.8)' // Slate (default)
}
