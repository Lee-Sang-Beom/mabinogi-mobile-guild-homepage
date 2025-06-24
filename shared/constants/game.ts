import { CategoryKeyValue, KeyValue } from "../types/common";

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
export const jobTypeOptions: CategoryKeyValue[] = [
  // 전사 계열
  { name: "견습 전사", value: "견습 전사", category: "전사 계열" },
  { name: "전사", value: "전사", category: "전사 계열" },
  { name: "대검전사", value: "대검전사", category: "전사 계열" },
  { name: "검술사", value: "검술사", category: "전사 계열" },

  // 궁수 계열
  { name: "견습 궁수", value: "견습 궁수", category: "궁수 계열" },
  { name: "궁수", value: "궁수", category: "궁수 계열" },
  { name: "석궁사수", value: "석궁사수", category: "궁수 계열" },
  { name: "장궁병", value: "장궁병", category: "궁수 계열" },

  // 마법사 계열
  { name: "견습 마법사", value: "견습 마법사", category: "마법사 계열" },
  { name: "마법사", value: "마법사", category: "마법사 계열" },
  { name: "화염술사", value: "화염술사", category: "마법사 계열" },
  { name: "빙결술사", value: "빙결술사", category: "마법사 계열" },
  { name: "전격술사", value: "전격술사", category: "마법사 계열" },

  // 힐러 계열
  { name: "견습 힐러", value: "견습 힐러", category: "힐러 계열" },
  { name: "힐러", value: "힐러", category: "힐러 계열" },
  { name: "사제", value: "사제", category: "힐러 계열" },
  { name: "수도사", value: "수도사", category: "힐러 계열" },

  // 음유시인 계열
  { name: "견습 음유시인", value: "견습 음유시인", category: "음유시인 계열" },
  { name: "음유시인", value: "음유시인", category: "음유시인 계열" },
  { name: "댄서", value: "댄서", category: "음유시인 계열" },
  { name: "악사", value: "악사", category: "음유시인 계열" },

  // 도적 계열 (주석 수정)
  { name: "견습 도적", value: "견습 도적", category: "도적 계열" },
  { name: "도적", value: "도적", category: "도적 계열" },
  { name: "격투가", value: "격투가", category: "도적 계열" },
  { name: "듀얼블레이드", value: "듀얼블레이드", category: "도적 계열" },
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
 */
export const jobCategoryRepresentColors: Record<kindRepresentJob, string> = {
  warrior: "rgba(239, 68, 68, 0.8)", // Red
  archer: "rgba(34, 197, 94, 0.8)", // Green
  mage: "rgba(59, 130, 246, 0.8)", // Blue
  healer: "rgba(245, 158, 11, 0.8)", // Amber
  bard: "rgba(168, 85, 247, 0.8)", // Purple
  rouge: "rgba(255,24,202,0.8)", // Dark Gray
};

/**
 * @name jobCategoryColorPalettes
 * @description 각 직업 계열별 색상 팔레트
 */
export const jobCategoryColorPalettes: Record<
  (typeof jobcategoryKeys)[number],
  string[]
> = {
  "전사 계열": ["#d30505", "#e12020", "#fa5050", "#f46b6b"],
  "궁수 계열": ["#02732b", "#0daa46", "#23d162", "#71f6a0"],
  "마법사 계열": ["#1267ec", "#3790ff", "#68b1ff", "#7ab4f6", "#a5cdff"], // 5개로 확장
  "힐러 계열": ["#f59e0b", "#fbbf24", "#fcd34d", "#fef08a"],
  "음유시인 계열": ["#8200ff", "#911bff", "#a149ff", "#b06cff"],
  "도적 계열": ["#e4089e", "#ff35bd", "#fb43bd", "#ff70d1"],
};

/**
 * @name allJobCategoryColors
 * @description 모든 직업 카테고리 색상 (평면화된 배열)
 */
export const allJobCategoryColors = Object.values(
  jobCategoryColorPalettes,
).flat();

/**
 * @name jobColorSchemes
 * @description 직업 별 카테고리 색상 변수 (기존 호환성을 위해 유지)
 */
export const jobColorSchemes = jobCategoryColorPalettes;

/**
 * @name jobCategoryMap
 * @description 직업별로 category가 무엇이고, category별 무슨 색상을 가지는지에 대한 정보를 가짐
 * @description 예시: {검술사: {category:'전사 계열', color: '#146b6b'}, 견습 궁수: {category:'궁수 계열', color: '#02732b'}, ...}
 */
export const jobCategoryMap = jobTypeOptions.reduce(
  (acc, job) => {
    const category = job.category;
    const jobsInCategory = jobTypeOptions.filter(
      (j) => j.category === category,
    );
    const jobIndexInCategory = jobsInCategory.findIndex(
      (j) => j.value === job.value,
    );

    // @ts-ignore
    const colorPalette = jobCategoryColorPalettes[category];

    acc[job.value] = {
      category,
      color: colorPalette[jobIndexInCategory] || colorPalette[0], // 안전장치
    };

    return acc;
  },
  {} as Record<string, { category: string; color: string }>,
);

/**
 * @name getJobsByCategory
 * @description 특정 카테고리의 모든 직업을 반환하는 헬퍼 함수
 */
export const getJobsByCategory = (
  category: (typeof jobcategoryKeys)[number],
) => {
  return jobTypeOptions.filter((job) => job.category === category);
};

/**
 * @name getJobColor
 * @description 특정 직업의 색상을 반환하는 헬퍼 함수
 */
export const getJobColor = (jobName: string): string => {
  return jobCategoryMap[jobName]?.color || "#000000";
};

/**
 * @name getJobCategory
 * @description 특정 직업의 카테고리를 반환하는 헬퍼 함수
 */
export const getJobCategory = (jobName: string): string => {
  return jobCategoryMap[jobName]?.category || "";
};

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
