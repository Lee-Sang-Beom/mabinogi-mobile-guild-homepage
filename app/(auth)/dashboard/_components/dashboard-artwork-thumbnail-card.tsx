import Image from "next/image";
import {
  countTotalComments,
  getNoticeThumbnailImageSrc,
} from "@/shared/notice/utils";
import Link from "next/link";
import { NoticeResponse } from "@/shared/notice/api";
import { useGetCommentAll } from "@/shared/notice/hooks/use-get-comment-all";
import { MessageSquare } from "lucide-react";

interface DashboardArtworkThumbnailCardProps {
  artworkData: NoticeResponse;
}
export default function DashboardArtworkThumbnailCard({
  artworkData,
}: DashboardArtworkThumbnailCardProps) {
  const { data: commentsData, isPending } = useGetCommentAll(
    "collection_artwork_comment",
    artworkData.docId,
  );

  return (
    <Link
      href={`/community/${artworkData.docId}?tab=artwork`}
      className="space-y-4 flex-grow"
    >
      <div className="relative overflow-hidden rounded-lg aspect-video bg-black">
        <Image
          src={
            getNoticeThumbnailImageSrc(artworkData.content) ||
            "/images/bg-mabinogi-mobile-sky-user.jpg"
          }
          alt={artworkData.title}
          fill
          className="object-contain transition-transform duration-500"
        />
      </div>
      <div>
        <h3 className="font-medium">{artworkData.title}</h3>
        <p className="flex gap-2 text-xs text-muted-foreground mt-2">
          <span>by {artworkData.writeUserId}</span>
          <span>•</span>
          <span>{artworkData.mngDt}</span>
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
