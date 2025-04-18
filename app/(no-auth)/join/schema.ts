import { GuildRoleOptions, JobTypeOptions } from "@/shared/constants/game";
import { GuildRoleType, JobType } from "@/shared/types/game";
import * as z from "zod";
export const joinFormSchema = z
  .object({
    id: z.string().min(2, {
      message: "캐릭터 이름은 최소 2자 이상이어야 합니다.",
    }),
    password: z.string().min(6, {
      message: "비밀번호는 최소 6자 이상이어야 합니다.",
    }),
    confirmPassword: z.string(),
    otp: z
      .string()
      .length(6, { message: "OTP는 6자리여야 합니다." }), // OTP는 정확히 6자리로 검사
    job: z.enum(
      JobTypeOptions.map((job) => job.value) as [JobType, ...JobType[]], // Ensuring it's a tuple of literal types
      {
        required_error: "직업을 선택해주세요.",
      }
    ),
    role: z.enum(
      GuildRoleOptions.map((role) => role.value) as [
        GuildRoleType,
        ...GuildRoleType[]
      ], // Ensuring it's a tuple of literal types
      {
        required_error: "길드 내 등급을 선택해주세요.",
      }
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["password"],
  });
