import * as z from "zod";

// 게시판 정보
export const noticeFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: "제목을 입력해주세요" })
    .max(30, { message: "제목은 최대 30자 이하여야 합니다." }),
  content: z.string().min(1, { message: "내용을 입력해주세요" }),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "중요도를 선택해주세요",
  }),
  writeUserDocId: z.string(),
  writeUserId: z.string(),
  mngDt: z.string().nullable(),
});
export type NoticeFormSchema = z.infer<typeof noticeFormSchema>;

// 댓글정보
export const commentFormSchema = z.object({
  content: z.string().min(1, { message: "댓글 내용을 입력해주세요." }),
  noticeDocId: z.string(),
  writeUserDocId: z.string(),
  writeUserId: z.string(),
  parentCommentDocId: z.string().optional().nullable(), // 답글 작성 시 필요
});

export type CommentFormSchema = z.infer<typeof commentFormSchema>;
