import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiResponse } from '@/shared/types/api';
import { announcementService } from '@/service/announcement-service';
import { UpdateNoticeRequest } from '@/shared/notice/api';

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, UpdateNoticeRequest>({
    mutationFn: ({ docId, data }) => announcementService.update(docId, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('공지사항이 성공적으로 수정되었습니다.');
        queryClient.invalidateQueries({ queryKey: ['useGetAnnouncements'] }); // 필요 시 정확한 queryKey로 수정
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`공지사항 수정 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
