import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentRequest } from "@/shared/notice/api";
import { commentService } from "@/service/comment-service";

export function useCreateOrUpdateComment(
  noticeCollectionName: string,
  noticeDocId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CommentRequest) => commentService.upsert(input),
    onSuccess: () => {
      // 댓글 목록 refetch
      queryClient.invalidateQueries({
        queryKey: ["comments", noticeCollectionName, noticeDocId],
      });
    },
  });
}
