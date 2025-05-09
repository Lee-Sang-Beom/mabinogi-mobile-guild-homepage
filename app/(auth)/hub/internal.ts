export type Badge = {
  name: string; // 뱃지명
  description: string; // 뱃지에 대한 설명
};

export interface BadgeInterface {
  badge: Badge; //
  isAcquisitionConditionsOpen: boolean; // 획득조건 공개여부
  acquisitionConditions: string; // 획득조건
  difficultyLevel: "쉬움" | "보통" | "어려움" | "매우 어려움"; // 획득 난이도
  imgName: string; // 이미지 이름
}
