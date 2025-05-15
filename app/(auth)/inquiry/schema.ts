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

  // 추가
  step: z.enum(["INQUIRY_STEP_IN_PROGRESS", "INQUIRY_STEP_RESOLVED"], {
    required_error: "진행도가 세팅되지 않았습니다.",
  }),
  isSecret: z.boolean(),
  inquiryResponseMessage: z.string(),
  inquiryResponseUserDocId: z.string().nullable(),
  inquiryResponseUserId: z.string().nullable(),
  inquiryResponseDt: z.string().nullable(),
});

export type InquiryFormSchema = z.infer<typeof inquiryFormSchema>;
