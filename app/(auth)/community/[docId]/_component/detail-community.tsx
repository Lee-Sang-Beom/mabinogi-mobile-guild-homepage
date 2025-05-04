"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, User as UserIcon } from "lucide-react";
import DisplayEditorContent from "@/components/editor/display-editor-content";
import { cn } from "@/lib/utils";
import { CommunityNoticeDetailProps } from "@/shared/notice/internal";
import { getPriorityBadge } from "@/shared/notice/utils";
import { useDeleteCommunity } from "../../hooks/use-delete-community";

export default function CommunityDetailPage({
  user,
  noticeData,
  tabType,
}: CommunityNoticeDetailProps) {
  const router = useRouter();
  const { mutate: deleteCommunity } = useDeleteCommunity(tabType);
  const isMe = user.docId === noticeData.writeUserDocId;

  const handleDeleteNotice = async () => {
    await deleteCommunity(noticeData.docId);
    router.push(`/community?tab=${tabType}`);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 relative w-full max-w-full overflow-x-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 20,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-1/4 bottom-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-amber-500/10 to-red-500/10 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 25,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">{noticeData.title}</CardTitle>
                </div>
                {getPriorityBadge(noticeData.priority)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-4">
                <UserIcon className="h-3 w-3 mr-1" />
                {noticeData.writeUserId}
                <p className={"mx-2"}>{"/"}</p>
                <Calendar className="h-3 w-3 mr-1" />
                {noticeData.mngDt}
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-t border-primary/10"></div>
              <DisplayEditorContent content={noticeData.content || ""} />
            </CardContent>
            <CardFooter
              className={cn(
                "flex justify-between",
                !isMe && "flex-row-reverse"
              )}
            >
              <Button
                variant="outline"
                onClick={() => {
                  router.push(`/community?tab=${tabType}`);
                }}
              >
                목록으로
              </Button>
              {isMe && (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeleteNotice();
                    }}
                  >
                    삭제하기
                  </Button>
                  <Button
                    variant="outline"
                    className={"text-black bg-primary"}
                    onClick={() => {
                      router.push(
                        `/community/${noticeData.docId}/edit?tab=${tabType}`
                      );
                    }}
                  >
                    수정하기
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
