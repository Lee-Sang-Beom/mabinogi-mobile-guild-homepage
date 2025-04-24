import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { ApiResponse } from '@/shared/types/api'
import { subUserService } from '@/service/sub-user-service'
import { subUsersFormSchema } from '@/app/(auth)/profile/schema'
import { Dispatch, SetStateAction } from 'react'

export function useAddSubUser(docId: string, setIsAddDialogOpen: Dispatch<SetStateAction<boolean>>) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, z.infer<typeof subUsersFormSchema>>({
    mutationFn: subUserService.addSubUser,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('서브캐릭터가 추가되었습니다.');
        queryClient.invalidateQueries({ queryKey: ['useGetSubusersBydocId', docId] });
        setIsAddDialogOpen(false);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`서브캐릭터 추가 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
