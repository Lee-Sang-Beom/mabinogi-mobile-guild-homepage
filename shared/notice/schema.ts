import * as z from "zod";

export const noticeFormSchema = z.object({
  title: z.string().min(1, { message: "제목을 입력해주세요" }),
  content: z.string().min(1, { message: "내용을 입력해주세요" }),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "중요도를 선택해주세요",
  }),
  writeUserDocId: z.string(),
  writeUserId: z.string(),
  mngDt: z.string().nullable(),
});
export type NoticeFormSchema = z.infer<typeof noticeFormSchema>;
