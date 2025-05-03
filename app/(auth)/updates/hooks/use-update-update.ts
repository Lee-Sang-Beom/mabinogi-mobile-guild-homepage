import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiResponse } from '@/shared/types/api';
import { UpdateNoticeRequest } from '@/shared/notice/api';
import { updateService } from '@/service/update-service';

export function useUpdateUpdates() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, UpdateNoticeRequest>({
    mutationFn: ({ docId, data }) => updateService.update(docId, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('업데이트 내용이 성공적으로 수정되었습니다.');
        queryClient.invalidateQueries({ queryKey: ['useGetUpdates'] }); // 필요 시 정확한 queryKey로 수정
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`업데이트 내용 수정 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
