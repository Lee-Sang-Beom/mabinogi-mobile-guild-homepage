"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  CornerDownRight,
  Edit2,
  MessageSquare,
  MessageSquarePlus,
  Reply,
  SendHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { AnimatedLoading } from "@/components/animated-loading";
import { CommentRequest, CommentResponse } from "@/shared/notice/api";
import { NoticeCommentProps } from "@/shared/notice/internal";
import { commentFormSchema, CommentFormSchema } from "@/shared/notice/schema";
import { useDeleteComment } from "@/shared/notice/hooks/use-delete-comment";
import { useGetCommentAll } from "@/shared/notice/hooks/use-get-comment-all";
import { useCreateOrUpdateComment } from "@/shared/notice/hooks/use-create-or-update-comment";

export default function Comment({
  noticeCollectionName,
  noticeDocId,
  currentUser,
}: NoticeCommentProps) {
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );
  const commentEndRef = useRef<HTMLDivElement>(null);

  // 댓글 가져오기
  const { data: commentsData, isPending } = useGetCommentAll(
    noticeCollectionName,
    noticeDocId,
  );

  // 댓글 등록/수정
  const { mutate: upsertComment, isPending: isUpsertPending } =
    useCreateOrUpdateComment(noticeCollectionName, noticeDocId);

  // 댓글 삭제
  const { mutate: deleteComment, isPending: isDeletePending } =
    useDeleteComment(noticeCollectionName, noticeDocId);

  // 새 댓글 폼
  const newCommentForm = useForm<CommentFormSchema>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
      noticeDocId,
      writeUserDocId: currentUser.docId,
      writeUserId: currentUser.id,
    },
  });

  // 수정 댓글 폼
  const editCommentForm = useForm<CommentFormSchema>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
      noticeDocId,
      writeUserDocId: currentUser.docId,
      writeUserId: currentUser.id,
    },
  });

  // 답글 작성 폼
  const replyForm = useForm<CommentFormSchema>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
      noticeDocId,
      writeUserDocId: currentUser.docId,
      writeUserId: currentUser.id,
      parentCommentDocId: null,
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
          newCommentForm.reset();
          // 새 댓글이 추가되면 스크롤 이동
          setTimeout(() => {
            commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
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
      newCommentForm,
    ],
  );

  // 답글 등록 핸들러
  const handleSubmitReply = useCallback(
    (values: CommentFormSchema) => {
      if (!replyToId) return;

      const replyRequest: CommentRequest = {
        docId: null,
        noticeCollectionName,
        noticeDocId,
        content: values.content,
        regDt: new Date().toISOString(),
        modifyDt: new Date().toISOString(),
        writeUserDocId: currentUser.docId,
        writeUserId: currentUser.id,
        parentCommentDocId: replyToId,
      };

      upsertComment(replyRequest, {
        onSuccess: () => {
          replyForm.reset();
          setReplyToId(null);
          // 답글이 추가된 후 답글 영역 확장
          setExpandedReplies((prev) => new Set([...prev, replyToId]));
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
      replyToId,
      replyForm,
    ],
  );

  // 댓글 수정 핸들러
  const handleEditComment = useCallback(
    (values: CommentFormSchema) => {
      if (!editCommentId) return;

      // 수정할 댓글 찾기
      const commentToEdit = findComment(
        commentsData?.data || [],
        editCommentId,
      );
      if (!commentToEdit) return;

      const editRequest: CommentRequest = {
        docId: editCommentId,
        noticeCollectionName,
        noticeDocId,
        content: values.content,
        regDt: commentToEdit.regDt,
        modifyDt: new Date().toISOString(),
        writeUserDocId: currentUser.docId,
        writeUserId: currentUser.id,
        parentCommentDocId: commentToEdit.parentCommentDocId,
      };

      upsertComment(editRequest, {
        onSuccess: () => {
          editCommentForm.reset();
          setEditCommentId(null);
          toast.success("댓글이 수정되었습니다.");
        },
        onError: () => {
          toast.error("댓글 수정에 실패했습니다.");
        },
      });
    },
    [
      upsertComment,
      editCommentId,
      noticeCollectionName,
      noticeDocId,
      currentUser,
      commentsData,
      editCommentForm,
    ],
  );

  // 댓글 삭제 핸들러
  const handleDeleteComment = useCallback(
    (commentId: string) => {
      if (window.confirm("정말로 삭제하시겠습니까?")) {
        deleteComment(commentId, {
          onSuccess: () => {
            toast.success("댓글이 삭제되었습니다.");
          },
          onError: () => {
            toast.error("댓글 삭제에 실패했습니다.");
          },
        });
      }
    },
    [deleteComment],
  );

  // 답글 모드 설정
  const handleReplyTo = useCallback(
    (commentId: string) => {
      setReplyToId(commentId);
      setEditCommentId(null);
      // 폼 초기화
      replyForm.reset({
        content: "",
        noticeDocId,
        writeUserDocId: currentUser.docId,
        writeUserId: currentUser.id,
        parentCommentDocId: commentId,
      });
    },
    [noticeDocId, currentUser, replyForm],
  );

  // 수정 모드 설정
  const handleEditMode = useCallback(
    (comment: CommentResponse) => {
      setEditCommentId(comment.docId);
      setReplyToId(null);
      // 폼에 기존 내용 설정
      editCommentForm.reset({
        content: comment.content,
        noticeDocId,
        writeUserDocId: currentUser.docId,
        writeUserId: currentUser.id,
      });
    },
    [noticeDocId, currentUser, editCommentForm],
  );

  // 답글 토글
  const toggleReplies = useCallback((commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  // 댓글 검색 헬퍼 함수
  const findComment = (
    comments: CommentResponse[],
    targetId: string,
  ): CommentResponse | null => {
    for (const comment of comments) {
      if (comment.docId === targetId) {
        return comment;
      }

      if (comment.childrenComment?.length) {
        const found = findComment(comment.childrenComment, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // 아바타에 사용할 이니셜 생성 함수
  const getInitials = (name: string) => {
    return name.substring(0, 1).toUpperCase();
  };

  // 포맷된 날짜 반환
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "";
      return format(new Date(dateString), "yyyy.MM.dd HH:mm", { locale: ko });
    } catch (error) {
      return dateString;
    }
  };

  // 댓글 렌더링 함수
  const renderComment = (comment: CommentResponse, depth: number = 0) => {
    const isEditing = editCommentId === comment.docId;
    const hasReplies =
      comment.childrenComment && comment.childrenComment.length > 0;
    const isRepliesExpanded = expandedReplies.has(comment.docId);
    const isReplyingTo = replyToId === comment.docId;
    const isOwnComment = comment.writeUserDocId === currentUser.docId;

    return (
      <motion.div
        key={comment.docId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`pl-${depth > 0 ? 6 : 0} mt-2`}
      >
        <Card
          className={`overflow-hidden border ${depth > 0 ? "border-l-4 border-l-amber-300/30" : ""}`}
        >
          <CardContent className="p-4">
            {!isEditing ? (
              <>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 bg-gradient-to-br from-amber-400 to-amber-600">
                    <AvatarFallback>
                      {getInitials(comment.writeUserId)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="font-medium">{comment.writeUserId}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {formatDate(comment.regDt)}
                        {comment.modifyDt !== comment.regDt && (
                          <span className="text-xs italic">(수정됨)</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-sm whitespace-pre-wrap">
                      {comment.content}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleReplyTo(comment.docId)}
                      >
                        <Reply className="h-3.5 w-3.5 mr-1" />
                        답글
                      </Button>

                      {isOwnComment && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs"
                            onClick={() => handleEditMode(comment)}
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            수정
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-100/30"
                            onClick={() => handleDeleteComment(comment.docId)}
                            disabled={isDeletePending}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            삭제
                          </Button>
                        </>
                      )}

                      {hasReplies && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs ml-auto"
                          onClick={() => toggleReplies(comment.docId)}
                        >
                          <MessageSquarePlus className="h-3.5 w-3.5 mr-1" />
                          {isRepliesExpanded
                            ? "접기"
                            : `답글 ${comment.childrenComment?.length}개`}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 답글 작성 폼 */}
                <AnimatePresence>
                  {isReplyingTo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pl-8 border-l-2 border-amber-200"
                    >
                      <Form {...replyForm}>
                        <form
                          onSubmit={replyForm.handleSubmit(handleSubmitReply)}
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
                              onClick={() => setReplyToId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormField
                            control={replyForm.control}
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
                              disabled={
                                isUpsertPending || !replyForm.formState.isValid
                              }
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
                  )}
                </AnimatePresence>
              </>
            ) : (
              // 수정 폼
              <Form {...editCommentForm}>
                <form
                  onSubmit={editCommentForm.handleSubmit(handleEditComment)}
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
                      onClick={() => setEditCommentId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormField
                    control={editCommentForm.control}
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
                      disabled={
                        isUpsertPending || !editCommentForm.formState.isValid
                      }
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
            )}
          </CardContent>
        </Card>

        {/* 답글 목록 */}
        <AnimatePresence>
          {hasReplies && isRepliesExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="ml-6 pl-2 border-l-2 border-amber-200/50 mt-2"
            >
              {comment.childrenComment?.map((reply) =>
                renderComment(reply, depth + 1),
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto my-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="text-amber-500" />
          <h2 className="text-xl font-semibold">댓글</h2>
          {!isPending && commentsData?.data && (
            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
              {commentsData.data.length}
            </span>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <Form {...newCommentForm}>
              <form
                onSubmit={newCommentForm.handleSubmit(handleSubmitComment)}
                className="space-y-4"
              >
                <FormField
                  control={newCommentForm.control}
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
                    disabled={
                      isUpsertPending || !newCommentForm.formState.isValid
                    }
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

        {isPending ? (
          <div className="flex justify-center py-8">
            <AnimatedLoading />
          </div>
        ) : commentsData?.data && commentsData.data.length > 0 ? (
          <div className="space-y-4">
            {commentsData.data.map((comment) => renderComment(comment))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted bg-foreground/50">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 " />
            <p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
          </div>
        )}
      </motion.div>

      {/* 댓글 끝 표시 (새 댓글 작성 시 스크롤 위치) */}
      <div ref={commentEndRef} />
    </div>
  );
}
