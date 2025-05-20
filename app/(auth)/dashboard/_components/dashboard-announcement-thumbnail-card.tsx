import { countTotalComments, getPriorityBadge } from "@/shared/notice/utils";
import Link from "next/link";
import { NoticeResponse } from "@/shared/notice/api";
import { useGetCommentAll } from "@/shared/notice/hooks/use-get-comment-all";
import { MessageSquare } from "lucide-react";

interface DashboardAnnouncementThumbnailCardProps {
  noticeData: NoticeResponse;
}
export default function DashboardAnnouncementThumbnailCard({
  noticeData,
}: DashboardAnnouncementThumbnailCardProps) {
  const { data: commentsData, isPending } = useGetCommentAll(
    "collection_announcement_comment",
    noticeData.docId,
  );

  return (
    <Link
      href={`/announcements/${noticeData.docId}`}
      className="flex items-center gap-3"
    >
      {getPriorityBadge(noticeData.priority)}
      <div>
        <p className="font-medium">{noticeData.title}</p>
        <p className="flex gap-2 text-xs text-muted-foreground mt-2">
          <span>by {noticeData.writeUserId}</span>
          <span>•</span>
          <span>{noticeData.mngDt}</span>
          <span>•</span>
          <span className={"flex items-center"}>
            <MessageSquare className="h-3 w-3 mr-1" />
            {commentsData?.data && !isPending
              ? countTotalComments(commentsData.data)
              : 0}
          </span>
        </p>
      </div>
    </Link>
  );
}
