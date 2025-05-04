import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/shared/types/api";
import { NoticeResponse } from "@/shared/notice/api";
import { updateService } from "@/service/update-service";

export function useGetLatestUpdate() {
  return useQuery<ApiResponse<NoticeResponse | null>, Error>({
    queryKey: ["useGetLatestUpdate"],
    queryFn: () => updateService.getLatest(),
  });
}
