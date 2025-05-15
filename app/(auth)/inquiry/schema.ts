import * as z from "zod";

export const inquiryFormSchema = z.object({
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
export type InquiryFormSchema = z.infer<typeof inquiryFormSchema>;
