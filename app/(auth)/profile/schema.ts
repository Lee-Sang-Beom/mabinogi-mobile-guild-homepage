import * as z from 'zod'
import { guildRoleOptions, jobTypeOptions } from '@/shared/constants/game'
import { GuildRoleType, JobType } from '@/shared/types/game'

export const profileFormSchema = z.object({
  docId: z.string().min(20, {
    message: "문서 아이디는 최소 20자 이상으로 구성된 문자열이어야 합니다.",
  }),
  id: z.string().min(2, {
    message: "캐릭터 이름은 최소 2자 이상이어야 합니다.",
  }),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 6,
      { message: "비밀번호는 최소 6자 이상이어야 합니다." }
    ),
  otp: z
    .string()
    .length(6, { message: "OTP는 6자리여야 합니다." }), // OTP는 정확히 6자리로 검사
  job: z.enum(
    jobTypeOptions.map((job) => job.value) as [JobType, ...JobType[]], // Ensuring it's a tuple of literal types
    {
      required_error: "직업을 선택해주세요.",
    }
  ),
  role: z.enum(
    guildRoleOptions.map((role) => role.value) as [
      GuildRoleType,
      ...GuildRoleType[]
    ], // Ensuring it's a tuple of literal types
    {
      required_error: "길드 내 등급을 선택해주세요.",
    }
  ),
})

export const subUsersFormSchema = z.object({
  parentDocId: z.string().min(20, {
    message: "대표캐릭터를 구별하기 위한 문서 아이디는 최소 20자 이상으로 구성된 문자열이어야 합니다.",
  }),
  id: z.string().min(2, {
    message: "캐릭터 이름은 최소 2자 이상이어야 합니다.",
  }),
  job: z.enum(
    jobTypeOptions.map((job) => job.value) as [JobType, ...JobType[]], // Ensuring it's a tuple of literal types
    {
      required_error: "직업을 선택해주세요.",
    }
  ),
})
