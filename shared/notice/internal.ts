// 게시판 형태에서 사용하는 공통 타입
import { User } from "next-auth"
import { NoticeResponse } from "./api"

/**
 * @name NoticeListProps
 * @description 리스트 출력되는 컴포넌트에서 받는 props
 */
export interface NoticeListProps {
  user: User;
}

/**
 * @name NoticeFormProps
 * @description 게시판 Form 컴포넌트에서 받는 props
 */
export interface NoticeFormProps {
    user: User
    type: 'CREATE' | 'UPDATE'
    noticeResponse: NoticeResponse | null
}

/**
 * @name NoticeDetailProps
 * @description 상세 게시판 정보
 */
export interface NoticeDetailProps {
  user: User;
  noticeData: NoticeResponse;
}