import { commentService } from "@/service/comment-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentNoticeCollectionName } from "@/shared/notice/internal";

export function useDeleteComment(
  noticeCollectionName: CommentNoticeCollectionName,
  noticeDocId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentDocId: string) =>
      commentService.delete(noticeCollectionName, noticeDocId, commentDocId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", noticeCollectionName, noticeDocId],
      });
    },
  });
}
