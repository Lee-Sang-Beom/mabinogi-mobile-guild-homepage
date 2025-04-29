import * as z from 'zod'
import { UseFormReturn } from 'react-hook-form'
import { jobTypeOptions } from '@/shared/constants/game'
import { JobType } from '@/shared/types/game'

const participateFormSchema = z.object({
  participateUserIsSubUser: z.boolean(),
  participateUserParentDocId: z.string().nullable(),
  participateUserDocId: z.string(),
  participateUserId: z.string(),
  participateUserJob: z.enum(
  jobTypeOptions.map((job) => job.value) as [JobType, ...JobType[]], // Ensuring it's a tuple of literal types
  {
    required_error: "직업을 선택해주세요.",
  }
)});


export const scheduleFormSchema = z.object({
  docId: z.string().nullable(),
  date: z.date({
    required_error: '날짜를 선택해주세요.',
  }),
  time: z.string({
    required_error: '시간을 선택해주세요.',
  }),

  title: z.string().min(2, {
    message: '파티 제목은 최소 2자 이상이어야 합니다.',
  }),
  content: z.string().min(2, {
    message: '파티 내용은 최소 2자 이상이어야 합니다.',
  }),
  maxParticipateCount: z.string({
    required_error: '제한 파티원 수를 선택해주세요.',
  }),

  participateWriteUser: participateFormSchema,
  participateEtcUser: z.array(participateFormSchema).min(0), // 빈 배열도 허용
})

export type ScheduleFormSchema = z.infer<typeof scheduleFormSchema>
export type addScheduleFormType = UseFormReturn<ScheduleFormSchema>
export type editScheduleFormType = UseFormReturn<ScheduleFormSchema>
export type onAddType = (values: ScheduleFormSchema) => void
export type TimeOptionsType = string[]