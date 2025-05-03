import { useQuery } from '@tanstack/react-query'
import { ApiResponse } from '@/shared/types/api'
import { NoticeResponse } from '@/shared/notice/api'
import { updateService } from '@/service/update-service'

export function useGetUpdates() {
  return useQuery<ApiResponse<NoticeResponse[]>, Error>({
    queryKey: ['useGetUpdates'],
    queryFn: () => updateService.get(), // selectedDate를 넘겨서 get 호출
  })
}
