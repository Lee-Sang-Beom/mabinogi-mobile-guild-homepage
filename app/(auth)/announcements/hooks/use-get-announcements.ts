import { useQuery } from '@tanstack/react-query'
import { ApiResponse } from '@/shared/types/api'
import { announcementService } from '@/service/announcement-service'
import { NoticeResponse } from '@/shared/notice/api'

export function useGetAnnouncements() {
  return useQuery<ApiResponse<NoticeResponse[]>, Error>({
    queryKey: ['useGetAnnouncements'],
    queryFn: () => announcementService.get(), // selectedDate를 넘겨서 get 호출
  })
}
