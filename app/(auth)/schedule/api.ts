import { ParticipateForm } from '@/app/(auth)/schedule/internal'

export interface ScheduleResponse {
  docId: string; // 파티 자체의 문서 ID
  date: string; // 파티 출발일자
  time: string; // 파티 출발시간
  title: string; // 구인글 제목
  content: string; // 구인글 내용
  userDocId: string; // 작성인 유저 문서 ID
  maxParticipateCount: number; // 최대참여인원
  mngDt: string; // 작성 및 수정 시간
  participateUserList: ParticipateForm[]; // 참여유저들
}