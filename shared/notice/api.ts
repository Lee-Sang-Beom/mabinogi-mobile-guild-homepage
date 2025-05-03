import { NoticeFormSchema } from "./schema";

// 게시판 형태에서 공통으로 사용되는 Response
export interface NoticeResponse {
    title: string;
    content: string;
    priority: 'high' | 'medium' | 'low'
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
  