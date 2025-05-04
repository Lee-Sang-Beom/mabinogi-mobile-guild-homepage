import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/shared/types/api";
import { ScheduleResponse } from "../../schedule/api";
import { scheduleService } from "@/service/schudule-service";

export function useGetLatestSchedule() {
  return useQuery<ApiResponse<ScheduleResponse | null>, Error>({
    queryKey: ["useGetLatestSchedule"],
    queryFn: () => scheduleService.getLatest(),
  });
}
