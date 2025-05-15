import { NoticeResponse } from "@/shared/notice/api";
import { InquiryStep } from "@/app/(auth)/inquiry/internal";
import { InquiryFormSchema } from "@/app/(auth)/inquiry/schema";

export interface InquiryResponse extends NoticeResponse {
  step: InquiryStep;
  isSecret: boolean; // 비밀글 여부
  inquiryResponseMessage: string; // 답변 메시지
  inquiryResponseUserDocId: string; // 답변자 docId
  inquiryResponseUserId: string; // 답변자 캐릭터 아이디
  inquiryResponseDt: string | null; // 답변 날짜
}

// 문의글 업데이트에 사용되는 Request
export interface UpdateInquiryRequest {
  docId: string;
  data: InquiryFormSchema;
}
