import { Badge } from '@/components/ui/badge'

/**
 * @name getPriorityBadge
 * @param priority 
 * @description 게시판 형태 글에 대한 우선순위 형태의 JSX.Element 반환 
 * @returns JSX.Element | null
 */
export const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge variant="destructive">중요</Badge>
    case 'medium':
      return <Badge variant="default">일반</Badge>
    case 'low':
      return <Badge variant="secondary">참고</Badge>
    default:
      return null
  }
}