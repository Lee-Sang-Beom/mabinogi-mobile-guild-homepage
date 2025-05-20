"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { AnimatedLoading } from "@/components/animated-loading";
import { CommentRequest } from "@/shared/notice/api";
import { commentFormSchema, CommentFormSchema } from "@/shared/notice/schema";
import { CommentNoticeCollectionName } from "@/shared/notice/internal";
import { useCreateOrUpdateComment } from "@/shared/notice/hooks/use-create-or-update-comment";

interface CommentFormProps {
  noticeCollectionName: CommentNoticeCollectionName;
  noticeDocId: string;
  currentUser: {
    docId: string;
    id: string;
  };
  onSuccess?: () => void;
}

export function CommentForm({
  noticeCollectionName,
  noticeDocId,
  currentUser,
  onSuccess,
}: CommentFormProps) {
  // 댓글 등록/수정
  const { mutate: upsertComment, isPending: isUpsertPending } =
    useCreateOrUpdateComment(noticeCollectionName, noticeDocId);

  const form = useForm<CommentFormSchema>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
      noticeDocId,
      writeUserDocId: currentUser.docId,
      writeUserId: currentUser.id,
    },
  });

  // 댓글 등록 핸들러
  const handleSubmitComment = useCallback(
    (values: CommentFormSchema) => {
      const commentRequest: CommentRequest = {
        docId: null, // 새 댓글이므로 null
        noticeCollectionName,
        noticeDocId,
        content: values.content,
        regDt: new Date().toISOString(),
        modifyDt: new Date().toISOString(),
        writeUserDocId: currentUser.docId,
        writeUserId: currentUser.id,
        parentCommentDocId: null,
      };

      upsertComment(commentRequest, {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
        onError: () => {
          toast.error("댓글 등록에 실패했습니다.");
        },
      });
    },
    [
      upsertComment,
      noticeCollectionName,
      noticeDocId,
      currentUser,
      form,
      onSuccess,
    ],
  );

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitComment)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="댓글을 작성해주세요..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isUpsertPending || !form.formState.isValid}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {isUpsertPending ? (
                  <span className="flex items-center">
                    <AnimatedLoading />
                    처리중...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <SendHorizontal className="h-4 w-4 mr-1" />
                    댓글 등록
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
