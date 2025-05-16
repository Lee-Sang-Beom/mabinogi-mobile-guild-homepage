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
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import EditorComponent from "@/components/editor/ck-editor";
import { compressContentImages } from "@/shared/utils/utils";
import moment from "moment";
import { useMemo, useState } from "react";
import { useCreateInquiry } from "@/app/(auth)/inquiry/hooks/use-create-inquiry";
import { useUpdateInquiry } from "@/app/(auth)/inquiry/hooks/use-update-inquiry";
import {
  type InquiryFormSchema,
  inquiryFormSchema,
} from "@/app/(auth)/inquiry/schema";
import type { InquiryFormProps } from "@/app/(auth)/inquiry/internal";
import { Switch } from "@/components/ui/switch";

export default function InquiryRequestForm({
  user,
  type,
  inquiryData,
}: InquiryFormProps) {
  const router = useRouter();

  const [docId, setDocId] = useState<string | null>(null);
  const defaultValues = useMemo<InquiryFormSchema>(() => {
    if (type === "UPDATE" && inquiryData) {
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
  }, [type, inquiryData, user]);

  const { mutateAsync: createInquiry, isPending: isCreateSubmitting } =
    useCreateInquiry();
  const { mutateAsync: updateInquiry, isPending: isUpdateSubmitting } =
    useUpdateInquiry();
  const form = useForm<InquiryFormSchema>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: defaultValues,
  });

  // 폼 제출 처리
  const onSubmit: SubmitHandler<InquiryFormSchema> = async (data) => {
    try {
      const contentWithCompressedImages = await compressContentImages(
        data.content,
      );
      const postData = {
        ...data,
        content: contentWithCompressedImages,
        mngDt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      };

      if (type === "CREATE") {
        await createInquiry(postData);
        router.push("/inquiry");
      } else {
        await updateInquiry({
          docId: docId!,
          data: postData,
        });

        router.push(`/inquiry/${docId}`);
      }
    } catch (error) {
      console.error("문의내용 등록 오류:", error);
    }
  };

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle className="sr-only">새 문의내용</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-base font-medium">
                          제목 <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="문의내용 제목을 입력하세요"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          내용 <span className="text-red-500">*</span>
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
                  <FormField
                    control={form.control}
                    name="isSecret"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">
                            비밀글
                          </FormLabel>
                          <FormDescription>
                            이 문의를 비밀글로 설정합니다
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
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
                  <Button
                    type="submit"
                    disabled={isCreateSubmitting || isUpdateSubmitting}
                  >
                    {isCreateSubmitting || isUpdateSubmitting ? (
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
