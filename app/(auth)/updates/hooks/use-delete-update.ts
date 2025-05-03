import { updateService } from '@/service/update-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useDeleteUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docIds: string | string[]) => updateService.delete(docIds),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['useGetUpdates'] });
    },
    onError: (error: unknown) => {
      console.error('업데이트 내용 삭제 실패:', error);
      toast.error('업데이트 내용 삭제 중 오류가 발생했습니다.');
    },
  });
};
