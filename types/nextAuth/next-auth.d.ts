import {GuildRoleType, JobType, YnFlag} from "@/shared/types/common";

declare module "next-auth" {
  interface User {
    docId: string; // 문서 ID
    id: string; // 유저 아이디
    password: string; // 유저 비밀번호
    role: GuildRoleType; // 유저 길드 내 등급
    job: JobType; // 유저 직업
    mngDt: string; // 관리날짜 (등록일, 수정일)
    isHaveEventBadge: YnFlag; // 이벤트 당첨 및 뱃지 보유여부
    approvalJoinYn: YnFlag; // 회원가입 승인여부
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
  }
}
