import { useQuery } from "@tanstack/react-query";
import { userBadgeService } from "@/service/user-badge-service";

/**
 * 모든 유저의 뱃지 개수를 조회하는 훅
 */
export const useGetAllUserBadgeCounts = () => {
  return useQuery({
    queryKey: ["useGetAllUserBadgeCounts"],
    queryFn: async () => {
      const response = await userBadgeService.getAllUserBadgeCounts();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
  });
};
