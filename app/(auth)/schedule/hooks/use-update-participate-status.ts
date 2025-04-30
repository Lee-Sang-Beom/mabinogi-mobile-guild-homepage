import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiResponse } from '@/shared/types/api';
import { scheduleService } from '@/service/schudule-service';
import { ParticipateForm } from '@/app/(auth)/schedule/internal'

/**
 * @name useUpdateParticipateStatus
 * @description 파티 참가/취소 처리
 */
export function useUpdateParticipateStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    Error,
    { scheduleDocId: string; participateUser: ParticipateForm; isParticipate: boolean }
  >({
    mutationFn: ({ scheduleDocId, participateUser, isParticipate }) =>
      scheduleService.updateParticipateStatus(scheduleDocId, participateUser, isParticipate),

    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message ?? '참여 상태가 변경되었습니다.');
        queryClient.invalidateQueries({ queryKey: ['useGetSchedules'] });
      } else {
        toast.error(response.message ?? '참여 상태 변경에 실패했습니다.');
      }
    },
    onError: (error) => {
      toast.error(`오류 발생: ${error.message}`);
    },
  });
}
