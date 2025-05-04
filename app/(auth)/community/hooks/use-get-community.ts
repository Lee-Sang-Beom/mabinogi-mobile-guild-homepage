import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/shared/types/api";
import { communityService } from "@/service/community-service";
import { NoticeResponse } from "@/shared/notice/api";
import { CommunityNoticeType } from "@/shared/notice/internal";

export function useGetCommunity(type: CommunityNoticeType) {
  return useQuery<ApiResponse<NoticeResponse[]>, Error>({
    queryKey: ["useGetCommunity", type],
    queryFn: () => communityService.get(type),
  });
}
