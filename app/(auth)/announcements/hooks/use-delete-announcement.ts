import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { announcementService } from '@/service/announcement-service'

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docIds: string | string[]) => announcementService.delete(docIds),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['useGetAnnouncements'] });
    },
    onError: (error: unknown) => {
      console.error('공지사항 삭제 실패:', error);
      toast.error('공지사항 삭제 중 오류가 발생했습니다.');
    },
  });
};
