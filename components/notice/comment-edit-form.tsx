"use client";

import { useCallback } from "react";
import { Edit2, X } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedLoading } from "@/components/animated-loading";
import { CommentRequest, CommentResponse } from "@/shared/notice/api";
import { commentFormSchema, CommentFormSchema } from "@/shared/notice/schema";
import { CommentNoticeCollectionName } from "@/shared/notice/internal";
import { useCreateOrUpdateComment } from "@/shared/notice/hooks/use-create-or-update-comment";
import { getInitials } from "@/shared/utils/utils";

interface CommentEditFormProps {
  comment: CommentResponse;
  noticeCollectionName: CommentNoticeCollectionName;
  noticeDocId: string;
  currentUser: {
    docId: string;
    id: string;
  };
  setEditCommentIdAction: (id: string | null) => void;
}

export function CommentEditForm({
  comment,
  noticeCollectionName,
  noticeDocId,
  currentUser,
  setEditCommentIdAction,
}: CommentEditFormProps) {
  // 댓글 등록/수정
  const { mutate: upsertComment, isPending: isUpsertPending } =
    useCreateOrUpdateComment(noticeCollectionName, noticeDocId);

  const form = useForm<CommentFormSchema>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: comment.content,
      noticeDocId,
      writeUserDocId: currentUser.docId,
      writeUserId: currentUser.id,
    },
  });

  // 댓글 수정 핸들러
  const handleEditComment = useCallback(
    (values: CommentFormSchema) => {
      const editRequest: CommentRequest = {
        docId: comment.docId,
        noticeCollectionName,
        noticeDocId,
        content: values.content,
        regDt: comment.regDt,
        modifyDt: new Date().toISOString(),
        writeUserDocId: currentUser.docId,
        writeUserId: currentUser.id,
        parentCommentDocId: comment.parentCommentDocId,
      };

      upsertComment(editRequest, {
        onSuccess: () => {
          form.reset();
          setEditCommentIdAction(null);
          toast.success("댓글이 수정되었습니다.");
        },
        onError: () => {
          toast.error("댓글 수정에 실패했습니다.");
        },
      });
    },
    [
      upsertComment,
      comment,
      noticeCollectionName,
      noticeDocId,
      currentUser,
      form,
      setEditCommentIdAction,
    ],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleEditComment)}
        className="space-y-2"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-gradient-to-br from-amber-400 to-amber-600">
              <AvatarFallback>
                {getInitials(comment.writeUserId)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{comment.writeUserId}</span>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setEditCommentIdAction(null)}
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
                  placeholder="댓글을 수정해주세요."
                  className="resize-none min-h-[100px]"
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
            variant="outline"
            disabled={isUpsertPending || !form.formState.isValid}
            className="bg-primary text-black"
          >
            {isUpsertPending ? (
              <span className="flex items-center">
                <AnimatedLoading />
                처리중...
              </span>
            ) : (
              <span className="flex items-center">
                <Edit2 className="h-4 w-4 mr-1" />
                수정 완료
              </span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
