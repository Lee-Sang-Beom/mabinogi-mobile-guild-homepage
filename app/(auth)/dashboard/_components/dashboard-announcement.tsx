import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ApiResponse } from "@/shared/types/api";
import { NoticeResponse } from "@/shared/notice/api";
import DashboardAnnouncementThumbnailCard from "@/app/(auth)/dashboard/_components/dashboard-announcement-thumbnail-card";

interface IProps {
  data: ApiResponse<NoticeResponse | null> | undefined;
}

export default function DashboardAnnouncement({ data }: IProps) {
  return (
    <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl h-full overflow-hidden group">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={{
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 0.5,
        }}
      />
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
          <Bell className="h-5 w-5 text-primary" />
          공지사항
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-4">
          {data?.data ? (
            <DashboardAnnouncementThumbnailCard noticeData={data.data} />
          ) : (
            <div className="w-full flex flex-col justify-center items-center gap-5">
              <Info className="w-15 h-15 text-blue-500" />
              작성된 공지사항이 없습니다.
            </div>
          )}

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary/10 transition-colors duration-300"
            >
              <Link
                href="/announcements"
                className="flex items-center justify-center w-full"
              >
                공지사항 페이지 이동
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                  }}
                  className="ml-2"
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
