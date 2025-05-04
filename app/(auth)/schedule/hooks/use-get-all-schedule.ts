import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/shared/types/api";
import { ScheduleResponse } from "@/app/(auth)/schedule/api";
import { scheduleService } from "@/service/schudule-service";

export function useGetAllSchedules() {
  return useQuery<ApiResponse<ScheduleResponse[]>, Error>({
    queryKey: ["useGetAllSchedules"], // 쿼리 키에 selectedDate를 포함
    queryFn: () => scheduleService.getAll(), // selectedDate를 넘겨서 get 호출
  });
}
