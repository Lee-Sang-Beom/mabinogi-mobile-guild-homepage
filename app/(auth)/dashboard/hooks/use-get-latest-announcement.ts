import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/shared/types/api";
import { announcementService } from "@/service/announcement-service";
import { NoticeResponse } from "@/shared/notice/api";

export function useGetLatestAnnouncement() {
  return useQuery<ApiResponse<NoticeResponse | null>, Error>({
    queryKey: ["useGetLatestAnnouncement"],
    queryFn: () => announcementService.getLatest(),
  });
}
