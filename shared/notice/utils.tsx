import { Badge } from "@/components/ui/badge";

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
