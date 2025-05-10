import * as z from "zod";

// 뱃지 폼 스키마
export const badgeFormSchema = z.object({
  badge: z.object({
    name: z.string().min(1, "뱃지명을 입력해주세요."),
    description: z.string().min(1, "뱃지 설명을 입력해주세요."),
  }),
  isAcquisitionConditionsOpen: z.boolean(),
  acquisitionConditions: z.string().min(1, "획득 조건을 입력해주세요."),
  difficultyLevel: z.enum(["쉬움", "보통", "어려움", "매우 어려움"] as const),
  imgName: z.string().min(1, "이미지 이름을 입력해주세요."),
});

export type BadgeFormSchemaType = z.infer<typeof badgeFormSchema>;
