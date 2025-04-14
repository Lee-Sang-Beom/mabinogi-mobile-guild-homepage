export type GuildRoleType =
  | "GUILD_MASTER"
  | "GUILD_SUB_MASTER"
  | "GUILD_MEMBER";

export type UserJobType =
  | "전사"
  | "대검전사"
  | "검술사"
  | "궁수"
  | "석궁사수"
  | "장궁병"
  | "마법사"
  | "화염술사"
  | "빙결술사"
  | "힐러"
  | "사제"
  | "수도사"
  | "음유시인"
  | "댄서"
  | "악사"
  | "견습 전사"
  | "견습 궁수"
  | "견습 마법사"
  | "견습 음유시인";

export interface LoginRequest {
  id: string;
  password: string;
}
