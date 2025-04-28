import { JobType } from '@/shared/types/game'

// 파티 대표 구인글 타입
export interface ScheduleRecruitForm {
  date: string; // 파티 출발일자
  time: string; // 파티 출발시간
  title: string; // 구인글 제목
  content: string; // 구인글 내용
  maxParticipateCount: number; // 최대참여인원

  participateWriteUser: ParticipateForm; // 참여하는 작성자 정보
  participateEtcUser: ParticipateForm[] // 참여하는 작성자 이외의 유저 정보

  userDocId: string; // 구인글을 작성한 대표 캐릭터의 문서 ID
  mngDt: string; // 작성 및 수정 시간
}

// 파티 참여 타입이자, 파티에 참여하는 유저: 이건 부캐일수도있고 본캐일수도 있음
export interface ParticipateForm {
  participateUserIsSubUser: boolean; // 참여 유저가 서브캐릭터인가?
  participateUserParentDocId: string | null; // 참여 캐릭터 부모 아이디 (이미 부모캐릭터면 null)
  participateUserDocId: string; // 참여 유저 문서 아이디
  participateUserId: string; // 참여 유저 아이디
  participateUserJob: JobType // 참여 유저 직업 (기본은 내 직업, 다른 직업 선택가능)
}
