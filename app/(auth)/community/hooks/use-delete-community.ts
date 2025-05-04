import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { communityService } from "@/service/community-service";
import { CommunityNoticeType } from "@/shared/notice/internal";

export const useDeleteCommunity = (type: CommunityNoticeType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docIds: string | string[]) =>
      communityService.delete(type, docIds),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({
        queryKey: ["useGetCommunity", type],
      });
    },
    onError: (error: unknown) => {
      toast.error(
        `${communityService.getCollectionTypeTabName(type)} 삭제 중 오류가 발생했습니다.`
      );
      console.error(
        `${communityService.getCollectionTypeTabName(type)} 삭제 중 오류가 발생했습니다.`,
        error
      );
    },
  });
};
