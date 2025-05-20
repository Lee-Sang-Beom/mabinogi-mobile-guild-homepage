import { useQuery } from "@tanstack/react-query";
import { CommentNoticeCollectionName } from "@/shared/notice/internal";
import { commentService } from "@/service/comment-service";

export function useGetCommentById(
  noticeCollectionName: CommentNoticeCollectionName,
  noticeDocId: string,
  commentDocId: string,
  enabled: boolean = true, // optional flag to control auto-fetching
) {
  return useQuery({
    queryKey: ["comment", commentDocId],
    queryFn: () =>
      commentService.getById(noticeCollectionName, noticeDocId, commentDocId),
    enabled,
  });
}
