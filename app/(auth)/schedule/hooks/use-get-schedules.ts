import { useQuery } from '@tanstack/react-query';
import { ApiResponse } from '@/shared/types/api';
import { ScheduleResponse } from '@/app/(auth)/schedule/api';
import { scheduleService } from '@/service/schudule-service';

export function useGetSchedules(selectedDate: Date) {
  return useQuery<ApiResponse<ScheduleResponse[]>, Error>({
    queryKey: ['useGetSchedules', selectedDate], // 쿼리 키에 selectedDate를 포함
    queryFn: () => scheduleService.get(selectedDate), // selectedDate를 넘겨서 get 호출
    enabled: !!selectedDate, // selectedDate가 있을 때만 쿼리 실행
  });
}
