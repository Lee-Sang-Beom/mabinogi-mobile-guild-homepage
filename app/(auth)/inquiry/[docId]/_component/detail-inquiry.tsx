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
import { InquiryDetailProps } from "@/app/(auth)/inquiry/internal";
import { useDeleteInquiry } from "@/app/(auth)/inquiry/hooks/use-delete-inquiry";
import { useState } from "react";
import ResponseMessageDialog from "@/app/(auth)/inquiry/[docId]/_component/response-message-dialog";
import { isHomePageAdmin } from "@/shared/utils/utils";

export default function InquiryDetailPage({
  user,
  inquiryData,
}: InquiryDetailProps) {
  const router = useRouter();
  const { mutate: deleteInquiry } = useDeleteInquiry();
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);

  // 내가 썼고 아직 문의 답변 이전인가?
  const isAvailableChange =
    inquiryData.step === "INQUIRY_STEP_IN_PROGRESS" &&
    inquiryData.writeUserDocId === user.docId;

  // 내가 썼고 문의 답변 이후인가? (추가적으로 홈페이지 관리자는 답변 내용 확인 가능)
  const isConfirmResponseMessage =
    inquiryData.step === "INQUIRY_STEP_RESOLVED" &&
    (inquiryData.writeUserDocId === user.docId || isHomePageAdmin(user));

  const handleDeleteInquiry = () => {
    deleteInquiry(inquiryData.docId);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 relative w-full max-w-full overflow-x-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-indigo-500/30 to-blue-500/20 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-1/4 bottom-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-pink-500/30 to-orange-500/20 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
        transition={{
          repeat: Infinity,
          duration: 25,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 문의 내용 */}
          <Card className="bg-background/60 backdrop-blur-lg border-primary/20 shadow-2xl overflow-hidden">
            <CardHeader className="pb-2 border-b border-primary/20">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-semibold">
                  {inquiryData.title}
                </CardTitle>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <UserIcon className="h-4 w-4 mr-1" />
                {inquiryData.writeUserId}
                <span className="mx-2">/</span>
                <Calendar className="h-4 w-4 mr-1" />
                {inquiryData.mngDt}
              </div>
            </CardHeader>
            <CardContent>
              <DisplayEditorContent content={inquiryData.content || ""} />
            </CardContent>
            <CardFooter
              className={cn(
                "flex justify-between py-4",
                !isAvailableChange &&
                  !isConfirmResponseMessage &&
                  "flex-row-reverse"
              )}
            >
              <Button variant="outline" onClick={() => router.push("/inquiry")}>
                목록으로
              </Button>

              {/* 내가 썼고 아직 문의 답변 이전 */}
              {isAvailableChange && (
                <div className="flex gap-3">
                  <Button variant="destructive" onClick={handleDeleteInquiry}>
                    삭제하기
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white bg-primary hover:bg-primary/90"
                    onClick={() =>
                      router.push(`/inquiry/${inquiryData.docId}/edit`)
                    }
                  >
                    수정하기
                  </Button>
                </div>
              )}

              {/* 내가 썼고 문의 답변 완료되었을 때 */}
              {isConfirmResponseMessage && (
                <ResponseMessageDialog
                  isResponseDialogOpen={isResponseDialogOpen}
                  setIsResponseDialogOpen={setIsResponseDialogOpen}
                  inquiryData={inquiryData}
                />
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
