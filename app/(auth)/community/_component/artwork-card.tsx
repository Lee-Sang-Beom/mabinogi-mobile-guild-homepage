"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NoticeResponse } from "@/shared/notice/api";
import {
  getNoticeThumbnailImageSrc,
  getPriorityBadge,
} from "@/shared/notice/utils";
import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export interface ArtworkCardProps {
  noticeData: NoticeResponse;
}
export default function ArtworkCard({ noticeData }: ArtworkCardProps) {
  const router = useRouter();
  return (
    <motion.div transition={{ type: "spring", stiffness: 400, damping: 10 }}>
      <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl overflow-hidden h-full">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={
              getNoticeThumbnailImageSrc(noticeData.content) ||
              "/images/bg-mabinogi-mobile-sky-user.jpg"
            }
            alt={noticeData.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="100vw"
            priority
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{noticeData.title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            {noticeData.writeUserId}
            <span className="mx-2">•</span>
            <Calendar className="h-3 w-3 mr-1" />
            {noticeData.mngDt}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm">
              {getPriorityBadge(noticeData.priority)}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push(`/community/${noticeData.docId}?tab=artwork`);
            }}
          >
            자세히 보기
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
