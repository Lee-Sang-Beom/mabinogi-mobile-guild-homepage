import { useQuery } from '@tanstack/react-query';
import { DashboardJobDistributionResponse } from '@/app/(auth)/dashboard/api'
import { userService } from '@/service/user-service'

/**
 * 직업 분포도 데이터 조회용 훅
 */
export const useGetJobDistributionList = () => {
  return useQuery<DashboardJobDistributionResponse[] | null>({
    queryKey: ['jobDistributionList'],
    queryFn: async () => {
      return await userService.findJobDistributionList();
    },
    // staleTime: 1000 * 60 * 5, // 5분 동안 fresh한 데이터로 간주(5분동안 캐시된 데이터 그대로 사용하고 네트워크 요청 다시안함)
    // refetchOnWindowFocus: false, // 브라우저 창이 다시 포커스될 때 자동으로 데이터를 재요청할지 여부 (여기선 아님)
  });
};
