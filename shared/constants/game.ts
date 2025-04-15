import { KeyValue } from "../types/common";

/**
 * @name GuildRoleOptions
 * @description 길드 내 등급 (name-value 형태)
 */
export const GuildRoleOptions: KeyValue[] = [
  { name: "길드 마스터", value: "GUILD_MASTER" },
  { name: "부길드 마스터", value: "GUILD_SUB_MASTER" },
  { name: "길드원", value: "GUILD_MEMBER" },
] as const;

/**
 * @name JobTypeOptions
 * @description 게임 내 직업 리스트 (name-value 형태)
 */
export const JobTypeOptions: KeyValue[] = [
  { name: "전사", value: "전사" },
  { name: "대검전사", value: "대검전사" },
  { name: "검술사", value: "검술사" },
  { name: "궁수", value: "궁수" },
  { name: "석궁사수", value: "석궁사수" },
  { name: "장궁병", value: "장궁병" },
  { name: "마법사", value: "마법사" },
  { name: "화염술사", value: "화염술사" },
  { name: "빙결술사", value: "빙결술사" },
  { name: "힐러", value: "힐러" },
  { name: "사제", value: "사제" },
  { name: "수도사", value: "수도사" },
  { name: "음유시인", value: "음유시인" },
  { name: "댄서", value: "댄서" },
  { name: "악사", value: "악사" },
  { name: "견습 전사", value: "견습 전사" },
  { name: "견습 궁수", value: "견습 궁수" },
  { name: "견습 마법사", value: "견습 마법사" },
  { name: "견습 음유시인", value: "견습 음유시인" },
] as const;
