import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/shared/types/api";
import { badgeService } from "@/service/badge-service";
import { BadgeResponse } from "@/app/(auth)/hub/api";

export function useGetBadgeById(docId: string) {
  return useQuery<ApiResponse<BadgeResponse | null>, Error>({
    queryKey: ["useGetBadgeById", docId],
    queryFn: () => badgeService.getByDocId(docId),
    enabled: !!docId, // docId가 있을 때만 실행
  });
}
