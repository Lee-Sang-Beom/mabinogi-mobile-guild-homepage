import * as z from 'zod'
import { GuildRoleOptions, JobTypeOptions } from '@/shared/constants/game'
import { GuildRoleType, JobType } from '@/shared/types/game'

export const forgotPasswordStep1FormSchema = z.object({
  id: z.string().min(2, {
    message: "캐릭터 이름은 최소 2자 이상이어야 합니다.",
  }),
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
  otp: z
    .string()
    .length(6, { message: "OTP는 6자리여야 합니다." }), // OTP는 정확히 6자리로 검사
})

export const forgotPasswordStep2FormSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
      .regex(/[a-z]/, { message: "비밀번호는 최소 하나의 소문자를 포함해야 합니다." })
      .regex(/[0-9]/, { message: "비밀번호는 최소 하나의 숫자를 포함해야 합니다." })
      .regex(/[^A-Za-z0-9]/, { message: "비밀번호는 최소 하나의 특수문자를 포함해야 합니다." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })
