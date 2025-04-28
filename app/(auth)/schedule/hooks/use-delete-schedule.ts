import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiResponse } from '@/shared/types/api';
import { scheduleService } from '@/service/schudule-service'

/**
 * @name useDeleteSchedule
 * @description 파티구인글 삭제 훅
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, string>({
    mutationFn: scheduleService.delete,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('파티구인글이 삭제되었습니다.');
        queryClient.invalidateQueries({ queryKey: ['useGetSchedules'] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`파티구인글 삭제 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
