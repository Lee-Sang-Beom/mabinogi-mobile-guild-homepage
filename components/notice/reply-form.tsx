"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { CornerDownRight, SendHorizontal, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { AnimatedLoading } from "@/components/animated-loading";
import { CommentRequest, CommentResponse } from "@/shared/notice/api";
import { commentFormSchema, CommentFormSchema } from "@/shared/notice/schema";
import { CommentNoticeCollectionName } from "@/shared/notice/internal";
import { useCreateOrUpdateComment } from "@/shared/notice/hooks/use-create-or-update-comment";

interface ReplyFormProps {
  comment: CommentResponse;
  noticeCollectionName: CommentNoticeCollectionName;
  noticeDocId: string;
  currentUser: {
    docId: string;
    id: string;
  };
  setReplyToIdAction: (id: string | null) => void;
  onSuccess?: () => void;
}

export function ReplyForm({
  comment,
  noticeCollectionName,
  noticeDocId,
  currentUser,
  setReplyToIdAction,
  onSuccess,
}: ReplyFormProps) {
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
      parentCommentDocId: comment.docId,
    },
  });

  // 답글 등록 핸들러
  const handleSubmitReply = useCallback(
    (values: CommentFormSchema) => {
      const replyRequest: CommentRequest = {
        docId: null,
        noticeCollectionName,
        noticeDocId,
        content: values.content,
        regDt: new Date().toISOString(),
        modifyDt: new Date().toISOString(),
        writeUserDocId: currentUser.docId,
        writeUserId: currentUser.id,
        parentCommentDocId: comment.docId,
      };

      upsertComment(replyRequest, {
        onSuccess: () => {
          form.reset();
          setReplyToIdAction(null);
          onSuccess?.();
        },
        onError: () => {
          toast.error("답글 등록에 실패했습니다.");
        },
      });
    },
    [
      upsertComment,
      noticeCollectionName,
      noticeDocId,
      currentUser,
      comment.docId,
      form,
      setReplyToIdAction,
      onSuccess,
    ],
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-4 pl-8 border-l-2 border-amber-200"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmitReply)}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <CornerDownRight className="h-4 w-4" />
            <span>{comment.writeUserId}님에게 답글 작성</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-6 w-6 p-0 ml-auto"
              onClick={() => setReplyToIdAction(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="답글을 작성해주세요."
                    className="resize-none min-h-[80px]"
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
              size="sm"
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
                  답글 등록
                </span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
