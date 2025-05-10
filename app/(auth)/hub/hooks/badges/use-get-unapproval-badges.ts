import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/shared/types/api";
import { badgeService } from "@/service/badge-service";
import { BadgeResponse } from "@/app/(auth)/hub/api";

export function useGetUnApprovedBadges() {
  return useQuery<ApiResponse<BadgeResponse[]>, Error>({
    queryKey: ["useGetUnApprovedBadges"],
    queryFn: () => badgeService.getAllUnApproved(),
    enabled: true,
  });
}
