import { NoticeFormSchema } from "./schema";
import { CommentNoticeCollectionName } from "@/shared/notice/internal";

// 게시판 형태에서 공통으로 사용되는 Response
export interface NoticeResponse {
  title: string;
  content: string;
  priority: "high" | "medium" | "low";
  mngDt: string;
  writeUserDocId: string;
  writeUserId: string;
  docId: string;
}

// 게시판 업데이트에 사용되는 Request
export interface UpdateNoticeRequest {
  docId: string;
  data: NoticeFormSchema;
}

// 게시판 댓글 response
export interface CommentResponse {
  noticeCollectionName: CommentNoticeCollectionName; // 댓글이 어떤 콜렉션에 달린건지 조회
  content: string; // 댓글 내용
  regDt: string; // 댓글 최초 등록일
  modifyDt: string; // 댓글 최종 수정일
  writeUserDocId: string; // 댓글을 단 유저의 docId
  writeUserId: string; // 댓글을 단 유저의 캐릭터명

  docId: string; // 댓글 자체의 collection docId
  noticeDocId: string; // 게시판의 docId
  parentCommentDocId: string | null; // 부모 댓글의 docId
  childrenComment: CommentResponse[] | null; // 답글 데이터
}

// 게시판 댓글 생성 request
export interface CommentRequest {
  docId: string | null; // 댓글 자체의 collection docId (최초생성이면 없음)
  noticeCollectionName: CommentNoticeCollectionName; // 댓글이 어떤 콜렉션에 달릴건지 결정
  noticeDocId: string; // 게시판의 docId
  content: string; // 댓글 내용
  regDt: string; // 댓글 최초 등록일
  modifyDt: string; // 댓글 최종 수정일
  writeUserDocId: string; // 댓글을 단 유저의 docId
  writeUserId: string; // 댓글을 단 유저의 캐릭터명
  parentCommentDocId: string | null; // 최초 생성 시 부모 댓글은 없음
}
