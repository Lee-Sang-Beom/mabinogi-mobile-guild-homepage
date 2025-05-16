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
import {
  ArrowLeft,
  Bell,
  Calendar,
  Save,
  User as UserIcon,
} from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import EditorComponent from "@/components/editor/ck-editor";
import { compressContentImages, isRoleAdmin } from "@/shared/utils/utils";
import { useEffect, useMemo, useState } from "react";
import { useUpdateInquiry } from "@/app/(auth)/inquiry/hooks/use-update-inquiry";
import {
  type InquiryFormSchema,
  inquiryFormSchema,
} from "@/app/(auth)/inquiry/schema";
import type {
  InquiryFormProps,
  InquiryStep,
} from "@/app/(auth)/inquiry/internal";
import moment from "moment";
import DisplayEditorContent from "@/components/editor/display-editor-content";
import { toast } from "sonner";

export default function InquiryResponseForm({
  user,
  inquiryData,
}: InquiryFormProps) {
  const router = useRouter();

  const [docId, setDocId] = useState<string | null>(null);
  const defaultValues = useMemo<InquiryFormSchema>(() => {
    if (inquiryData) {
      const { docId, ...rest } = inquiryData;
      setDocId(docId);
      return rest;
    }

    return {
      title: "",
      content: "",
      priority: "medium",
      writeUserDocId: user.docId,
      writeUserId: user.id,
      mngDt: null,
      step: "INQUIRY_STEP_IN_PROGRESS",
      isSecret: false,
      inquiryResponseMessage: "",
      inquiryResponseUserDocId: null,
      inquiryResponseUserId: null,
      inquiryResponseDt: null,
    };
  }, [inquiryData, user]);

  const { mutateAsync: updateInquiry, isPending: isUpdateSubmitting } =
    useUpdateInquiry();
  const form = useForm<InquiryFormSchema>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: defaultValues,
  });

  // 폼 제출 처리
  const onSubmit: SubmitHandler<InquiryFormSchema> = async (data) => {
    try {
      if (data.inquiryResponseMessage.length < 1) {
        toast.error("문의 답변 내용을 입력해주세요.");
        return;
      }
      const contentWithCompressedImages = await compressContentImages(
        data.inquiryResponseMessage,
      );
      const postData = {
        ...data,
        step: "INQUIRY_STEP_RESOLVED" as InquiryStep,
        inquiryResponseMessage: contentWithCompressedImages,
        inquiryResponseUserDocId: user.docId,
        inquiryResponseUserId: user.id,
        inquiryResponseDt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      };

      await updateInquiry({
        docId: docId!,
        data: postData,
      });

      router.push(`/admin-inquiry`);
    } catch (error) {
      console.error("문의내용 답변 오류:", error);
    }
  };

  useEffect(() => {
    if (!isRoleAdmin(user)) {
      toast.error("관리자만 접근 가능한 페이지입니다.");
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative w-full max-w-full overflow-x-hidden">
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
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              문의내용 작성
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            원하는 문의내용을 작성해주세요.
          </p>
        </motion.div>

        {inquiryData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={"mb-2"}
          >
            <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">
                      {inquiryData.title}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-4">
                  <UserIcon className="h-3 w-3 mr-1" />
                  문의자: {inquiryData.writeUserId}
                  <p className={"mx-2"}>{"/"}</p>
                  <Calendar className="h-3 w-3 mr-1" />
                  {inquiryData.mngDt}
                </div>
              </CardHeader>
              <CardContent>
                <div className="border-t border-primary/10"></div>
                <DisplayEditorContent content={inquiryData.content || ""} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle className="sr-only">답변 내용</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="inquiryResponseMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          답변 내용 <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <EditorComponent
                            content={field.value}
                            onContentChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    돌아가기
                  </Button>
                  <Button type="submit" disabled={isUpdateSubmitting}>
                    {isUpdateSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        저장 중...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="mr-2 h-4 w-4" />
                        저장하기
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
