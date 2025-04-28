import { useQuery } from '@tanstack/react-query';
import { ApiResponse } from '@/shared/types/api';
import { ScheduleResponse } from '@/app/(auth)/schedule/api'
import { scheduleService } from '@/service/schudule-service';

export function useGetSchedules() {
  return useQuery<ApiResponse<ScheduleResponse[]>, Error>({
    queryKey: ['useGetSchedules'],
    queryFn: () => scheduleService.get(),
  });
}
