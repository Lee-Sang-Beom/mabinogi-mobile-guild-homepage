// 행성 데이터 - 직업 계열별로 생성
import { jobcategoryKeys, jobColorSchemes } from "@/shared/constants/game";
import { hexToRgba } from "@/shared/utils/utils";

export const planets = jobcategoryKeys.map((category, index) => {
  // 행성 위치 계산 (원형으로 배치)
  const angle = (index / jobcategoryKeys.length) * Math.PI * 2;
  const centerX = 50; // 화면 중앙 X 좌표 (%)
  const centerY = 50; // 화면 중앙 Y 좌표 (%)

  // 행성 색상은 해당 카테고리의 대표 색상 사용
  const color = jobColorSchemes[category][0];

  return {
    id: `planet-${index}`,
    name: category,
    category: category,
    x: centerX + Math.cos(angle) * 30, // 화면 비율에 맞게 조정 (%)
    y: centerY + Math.sin(angle) * 30, // 화면 비율에 맞게 조정 (%)
    size: 50 + Math.random() * 20, // 행성 크기
    color: color, // 원래 HEX 색상 코드 유지
    ringColor: hexToRgba(color, 0.3), // 링 색상은 RGBA로 변환
    hasRings: index % 2 === 0, // 짝수 인덱스 행성만 고리 가짐
    rotationSpeed: 0.01 + Math.random() * 0.02,
  };
});
