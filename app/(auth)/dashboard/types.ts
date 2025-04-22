export interface DashboardJobDistributionResponse {
  job: string; // 직업명
  representCount: number; // 대표캐릭터 직업 수
  subCount: number; // 서브캐릭터 직업 수
  totalCount: number; // 합산 직업 수
}
