import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/shared/types/api";
import { NoticeResponse } from "@/shared/notice/api";
import { communityService } from "@/service/community-service";

export function useGetLatestArtworkCommunity() {
  return useQuery<ApiResponse<NoticeResponse | null>, Error>({
    queryKey: ["useGetLatestArtworkCommunity"],
    queryFn: () => communityService.getLatestArtwork(),
  });
}
