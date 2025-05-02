import { useQuery } from '@tanstack/react-query'
import { ApiResponse } from '@/shared/types/api'
import { announcementService } from '@/service/announcement-service'
import { AnnouncementResponse } from '@/app/(auth)/announcements/api'

export function useGetAnnouncements() {
  return useQuery<ApiResponse<AnnouncementResponse[]>, Error>({
    queryKey: ['useGetAnnouncements'],
    queryFn: () => announcementService.get(), // selectedDate를 넘겨서 get 호출
  })
}
