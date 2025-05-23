import { KeyValue } from "../types/common";

/**
 * @name homePageAdminId
 * @description 홈페이지 관리자 닉네임
 */
export const homePageAdminId = "영면";

/**
 * @name guildName
 * @description 길드명
 */
export const guildName = "어린이집";

/**
 * @name guildInfo
 * @description 길드정보
 */
export const guildInfo = {
  name: guildName,
  level: 4,
  memberCount: 30,
  maxMembers: 30,
  regDt: "2025-03-25",
  activityWeeklyTotalTime: 80,
};

/**
 * @name guildRoleOptions
 * @description 길드 내 등급 (name-value 형태)
 */
export const guildRoleOptions: KeyValue[] = [
  { name: "길드원", value: "GUILD_MEMBER" },
  { name: "길드 서브 마스터", value: "GUILD_SUB_MASTER" },
  { name: "길드 마스터", value: "GUILD_MASTER" },
  { name: "협력 길드 구성원", value: "COOPERATIVE_GUILD_MEMBERS" },
] as const;

/**
 * @name kindRepresentJob
 * @description 직업의 대표계열 종류
 */
export type kindRepresentJob =
  | "warrior"
  | "archer"
  | "mage"
  | "healer"
  | "bard"
  | "rouge";

/**
 * @name jobTypeOptions
 * @description 게임 내 직업 리스트 (name-value 형태)
 */
export const jobTypeOptions: KeyValue[] = [
  // 전사 계열
  { name: "견습 전사", value: "견습 전사" },
  { name: "전사", value: "전사" },
  { name: "대검전사", value: "대검전사" },
  { name: "검술사", value: "검술사" },

  // 궁수 계열
  { name: "견습 궁수", value: "견습 궁수" },
  { name: "궁수", value: "궁수" },
  { name: "석궁사수", value: "석궁사수" },
  { name: "장궁병", value: "장궁병" },

  // 마법사 계열
  { name: "견습 마법사", value: "견습 마법사" },
  { name: "마법사", value: "마법사" },
  { name: "화염술사", value: "화염술사" },
  { name: "빙결술사", value: "빙결술사" },

  // 힐러 계열
  { name: "견습 힐러", value: "견습 힐러" },
  { name: "힐러", value: "힐러" },
  { name: "사제", value: "사제" },
  { name: "수도사", value: "수도사" },

  // 음유시인 계열
  { name: "견습 음유시인", value: "견습 음유시인" },
  { name: "음유시인", value: "음유시인" },
  { name: "댄서", value: "댄서" },
  { name: "악사", value: "악사" },

  // 음유시인 계열
  { name: "견습 도적", value: "견습 도적" },
  { name: "도적", value: "도적" },
  { name: "격투가", value: "격투가" },
  { name: "듀얼블레이드", value: "듀얼블레이드" },
] as const;

/**
 * @name jobcategoryKeys
 * @description 직업 카테고리 키
 */
export const jobcategoryKeys = [
  "전사 계열",
  "궁수 계열",
  "마법사 계열",
  "힐러 계열",
  "음유시인 계열",
  "도적 계열",
] as const;

/**
 * @name jobCategoryRepresentColors
 * @description 대표직업계열 별 색상
 *
 * @name allJobCategoryColors
 * @description 세부 직업 카테고리 색상
 *
 * @name jobColorSchemes
 * @description 직업 별 카테고리 색상 변수
 *
 * @name jobCategoryMap
 * @description 직업별로 category가 무엇이고, category별 무슨 색상을 가지는지에 대한 정보를 가짐
 * @description 예시: {검술사: {category:'전사 계열', color: '#146b6b'}, 견습 궁수: {category:'궁수 계열', color: '#02732b'}, ...}
 */
export const jobCategoryRepresentColors: Record<kindRepresentJob, string> = {
  warrior: "rgba(239, 68, 68, 0.8)", // Red
  archer: "rgba(34, 197, 94, 0.8)", // Green
  mage: "rgba(59, 130, 246, 0.8)", // Blue
  healer: "rgba(245, 158, 11, 0.8)", // Amber
  bard: "rgba(168, 85, 247, 0.8)", // Purple
  rouge: "rgba(255,24,202,0.8)", // Dark Gray
};

export const allJobCategoryColors = [
  "#d30505",
  "#e12020",
  "#fa5050",
  "#f46b6b", // warrior
  "#02732b",
  "#0daa46",
  "#23d162",
  "#71f6a0", // archer
  "#1267ec",
  "#3790ff",
  "#68b1ff",
  "#7ab4f6", // mage
  "#f59e0b",
  "#fbbf24",
  "#fcd34d",
  "#fef08a", // healer
  "#8200ff",
  "#911bff",
  "#a149ff",
  "#b06cff", // bard
  "#e4089e",
  "#ff35bd",
  "#fb43bd",
  "#ff70d1", // rogue
] as const;

export const jobColorSchemes = jobcategoryKeys.reduce(
  (acc, key, index) => {
    const start = index * 4;
    acc[key] = allJobCategoryColors.slice(start, start + 4);
    return acc;
  },
  {} as Record<(typeof jobcategoryKeys)[number], string[]>,
);

export const jobCategoryMap = jobcategoryKeys.reduce(
  (acc, category) => {
    const jobsInCategory = jobColorSchemes[category];
    const jobNames = jobTypeOptions
      .slice(
        jobcategoryKeys.indexOf(category) * 4,
        jobcategoryKeys.indexOf(category) * 4 + 4,
      )
      .map((j) => j.value);

    for (let i = 0; i < jobNames.length; i++) {
      acc[jobNames[i]] = { category, color: jobsInCategory[i] };
    }

    return acc;
  },
  {} as Record<string, { category: string; color: string }>,
);

/**
 * @name participateCountList
 * @description 제한 파티원 수
 */
export const participateCountList: KeyValue[] = [1, 2, 3, 4, 5, 6, 7, 8].map(
  (num) => {
    const toStringNum = num.toString();
    return {
      name: toStringNum,
      value: toStringNum,
    };
  },
);
