import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ScheduleRecruitForm } from "@/app/(auth)/schedule/internal";
import { ApiResponse } from "@/shared/types/api";
import { scheduleService } from "@/service/schudule-service";

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, ScheduleRecruitForm>({
    mutationFn: (data) => scheduleService.add(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("파티원 모집 정보가 성공적으로 등록되었습니다.");
        queryClient.invalidateQueries({ queryKey: ["useGetSchedules"] });
        queryClient.invalidateQueries({ queryKey: ["useGetAllSchedules"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(
        `파티원 모집 정보 등록 중 오류가 발생했습니다: ${error.message}`
      );
    },
  });
}
