import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/shared/types/api";
import { badgeService } from "@/service/badge-service";
import { BadgeResponse } from "@/app/(auth)/hub/api";

export function useGetApprovalBadges() {
  return useQuery<ApiResponse<BadgeResponse[]>, Error>({
    queryKey: ["useGetApprovedBadges"],
    queryFn: () => badgeService.getAllApproved(),
    enabled: true,
  });
}
