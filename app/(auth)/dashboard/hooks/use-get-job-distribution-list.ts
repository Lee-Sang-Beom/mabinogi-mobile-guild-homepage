import { useQuery } from '@tanstack/react-query';
import { DashboardJobDistributionResponse } from '@/app/(auth)/dashboard/types'
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
    staleTime: 1000 * 60 * 5, // 5분 동안 fresh
    refetchOnWindowFocus: false,
  });
};
