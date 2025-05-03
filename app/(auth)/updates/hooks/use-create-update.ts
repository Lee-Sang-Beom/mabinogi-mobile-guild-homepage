import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiResponse } from '@/shared/types/api'
import { NoticeFormSchema } from '@/shared/notice/schema'
import { updateService } from '@/service/update-service'

export function useCreateUpdate() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<string | null>, Error, NoticeFormSchema>({
    mutationFn: (data) => updateService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('업데이트 내용이 성공적으로 등록되었습니다.')
        queryClient.invalidateQueries({ queryKey: ['useGetUpdates'] }) // 필요 시 정확한 queryKey로 수정
      } else {
        toast.error(response.message)
      }
    },
    onError: (error) => {
      toast.error(`업데이트 내용 등록 중 오류가 발생했습니다: ${error.message}`)
    },
  })
}
