import NextAuth from "next-auth";
import { GenderType, UserAuthType } from "../common/commonType";

declare module "next-auth" {
  interface User {
    id: string; // 유저 ID (유저 닉네임)
    password: string; // 유저 pswd
    authType: UserAuthType; // 유저 권한
    job: string; // 게임 내 직업
    gender: GenderType; // 성별
    useYn: "Y" | "N"; // 사용 여부
    userBirth: string; // 생년월일
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
