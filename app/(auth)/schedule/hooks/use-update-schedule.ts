import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiResponse } from "@/shared/types/api";
import { ScheduleRecruitForm } from "@/app/(auth)/schedule/internal";
import { scheduleService } from "@/service/schudule-service";
import { toast } from "sonner";

interface UpdateScheduleParams {
  docId: string;
  data: Partial<ScheduleRecruitForm>;
}

export const useUpdateScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, UpdateScheduleParams>({
    mutationFn: ({ docId, data }) => scheduleService.update(docId, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("파티원 모집 정보 수정이 완료되었습니다.");
        queryClient.invalidateQueries({ queryKey: ["useGetSchedules"] });
        queryClient.invalidateQueries({ queryKey: ["useGetAllSchedules"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(
        `파티원 모집 정보 수정 중 오류가 발생했습니다: ${error.message}`
      );
    },
  });
};
