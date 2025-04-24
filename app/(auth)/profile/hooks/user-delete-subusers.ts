import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiResponse } from '@/shared/types/api';
import { subUserService } from '@/service/sub-user-service'

export function useDeleteSubUser(docId: string) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, string>({
    mutationFn: subUserService.deleteSubUser,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ['useGetSubusersBydocId', docId] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`서브캐릭터 삭제 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
