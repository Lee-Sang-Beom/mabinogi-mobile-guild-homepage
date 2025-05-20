// 게시판 형태에서 사용하는 공통 타입
import { User } from "next-auth";
import { NoticeResponse } from "./api";

/**
 * @name CommentNoticeCollectionName
 * @description 댓글 기능을 포함할 게시판형태 콜렉션명
 */
export type CommentNoticeCollectionName =
  | "collection_announcement_comment"
  | "collection_update_comment"
  | "collection_artwork_comment"
  | "collection_tip_comment";

/**
 * @name CommunityNoticeType
 * @description 커뮤니티 게시판의 Tab 종류 (타입)
 */
export type CommunityNoticeType = "artwork" | "tips";

/**
 * @name NoticeListProps
 * @description 리스트 출력되는 컴포넌트에서 받는 props
 */
export interface NoticeListProps {
  user: User;
}

/**
 * @name NoticeFormProps, @name CommunityNoticeFormProps
 * @description 게시판 Form 컴포넌트에서 받는 props
 */
export interface NoticeFormProps extends NoticeListProps {
  type: "CREATE" | "UPDATE";
  noticeData: NoticeResponse | null;
}
export interface CommunityNoticeFormProps extends NoticeFormProps {
  tabType: CommunityNoticeType;
}

/**
 * @name NoticeDetailProps, @name CommunityNoticeDetailProps
 * @description 상세 게시판 정보에서 받는 props
 */
export interface NoticeDetailProps extends NoticeListProps {
  noticeData: NoticeResponse;
}
export interface CommunityNoticeDetailProps extends NoticeDetailProps {
  tabType: CommunityNoticeType;
}

/**
 * @name NoticeCommentProps
 * @description 게시판 댓글 컴포넌트가 받는 데이터 props
 */
export interface NoticeCommentProps {
  noticeCollectionName: CommentNoticeCollectionName;
  noticeDocId: string; // 게시판의 docId
  currentUser: User; // 현재 로그인 중인 유저정보
}
