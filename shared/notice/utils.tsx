import { Badge } from "@/components/ui/badge";
import { CommentResponse } from "./api";

/**
 * @name getPriorityBadge
 * @param priority
 * @description 게시판 형태 글에 대한 우선순위 형태의 JSX.Element 반환
 * @returns JSX.Element | null
 */
export const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge variant="destructive">중요</Badge>;
    case "medium":
      return <Badge variant="default">일반</Badge>;
    case "low":
      return <Badge variant="secondary">참고</Badge>;
    default:
      return null;
  }
};

/**
 * @name getNoticeThumbnailImageSrc
 * @param htmlContent
 * @description notice 게시판에서 content에서 이미지 썸네일을 가져옴
 * @returns img
 */
export const getNoticeThumbnailImageSrc = (htmlContent: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const img = doc.querySelector("img"); // 첫 번째 <img> 태그를 선택
  return img ? img.src : null; // 이미지가 없으면 null 반환
};

/**
 * @name findComment
 * @param comments 댓글 데이터
 * @param targetId 댓글 id
 */
export const findComment = (
  comments: CommentResponse[],
  targetId: string,
): CommentResponse | null => {
  for (const comment of comments) {
    if (comment.docId === targetId) {
      return comment;
    }

    if (comment.childrenComment?.length) {
      const found = findComment(comment.childrenComment, targetId);
      if (found) return found;
    }
  }
  return null;
};

/**
 * @name countTotalComments
 * @param comments
 * @description 댓글 수 반환
 */
export function countTotalComments(comments: CommentResponse[]): number {
  if (!comments) return 0;

  let count = 0;

  for (const comment of comments) {
    count += 1; // 현재 댓글
    if (comment.childrenComment && comment.childrenComment.length > 0) {
      count += countTotalComments(comment.childrenComment); // 대댓글 재귀적으로 합산
    }
  }

  return count;
}
