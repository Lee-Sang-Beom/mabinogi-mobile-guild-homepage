// 샘플 뱃지 데이터
import { BadgeFormSchemaType } from "@/app/(auth)/hub/schema";

export const formDefaultValues: BadgeFormSchemaType = {
  badge: {
    name: "",
    description: "",
  },
  isAcquisitionConditionsOpen: true,
  acquisitionConditions: "",
  difficultyLevel: "보통",
  imgName: "",
};
