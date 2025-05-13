import { userBadgeService } from "@/service/user-badge-service";
import { UserBadgeResponse } from "@/app/(auth)/(admin)/admin-badge/api";
import { useQuery } from "@tanstack/react-query";

/**
 * 🔍 특정 유저의 뱃지 목록 조회 (userDocId 기준)
 *
 * @param userDocId - 조회할 유저의 문서 ID
 */
export const useGetUserBadgesByUserDocId = (userDocId: string) => {
  return useQuery<UserBadgeResponse | null>({
    queryKey: ["useGetUserBadgesByUserDocId", userDocId],
    queryFn: async () => {
      const response =
        await userBadgeService.getUserBadgesByUserDocId(userDocId);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    enabled: !!(userDocId && userDocId.length > 0), // userDocId가 있을 때만 실행
  });
};
