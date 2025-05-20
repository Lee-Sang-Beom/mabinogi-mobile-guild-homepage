import { commentService } from "@/service/comment-service";
import { useQuery } from "@tanstack/react-query";
import { CommentNoticeCollectionName } from "@/shared/notice/internal";

export function useGetCommentAll(
  noticeCollectionName: CommentNoticeCollectionName,
  noticeDocId: string,
) {
  return useQuery({
    queryKey: ["comments", noticeCollectionName, noticeDocId],
    queryFn: () => commentService.getAll(noticeCollectionName, noticeDocId),
  });
}
