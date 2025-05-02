import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiResponse } from '@/shared/types/api'
import { AnnouncementFormSchema } from '@/app/(auth)/announcements/schema'
import { announcementService } from '@/service/announcement-service'

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<string | null>, Error, AnnouncementFormSchema>({
    mutationFn: (data) => announcementService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('공지사항이 성공적으로 등록되었습니다.')
        queryClient.invalidateQueries({ queryKey: ['useGetAnnouncements'] }) // 필요 시 정확한 queryKey로 수정
      } else {
        toast.error(response.message)
      }
    },
    onError: (error) => {
      toast.error(`공지사항 등록 중 오류가 발생했습니다: ${error.message}`)
    },
  })
}
