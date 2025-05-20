"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Edit2, MessageSquarePlus, Reply, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommentResponse } from "@/shared/notice/api";
import { formatDate, getInitials } from "@/shared/notice/utils";
import { ReplyForm } from "./reply-form";
import { CommentEditForm } from "@/components/notice/comment-edit-form";
import { CommentNoticeCollectionName } from "@/shared/notice/internal";
import { useDeleteComment } from "@/shared/notice/hooks/use-delete-comment";

interface CommentItemProps {
  comment: CommentResponse;
  depth: number;
  currentUser: {
    docId: string;
    id: string;
  };
  noticeCollectionName: CommentNoticeCollectionName;
  noticeDocId: string;
  replyToId: string | null;
  setReplyToIdAction: (id: string | null) => void;
  editCommentId: string | null;
  setEditCommentIdAction: (id: string | null) => void;
  expandedReplies: Set<string>;
  toggleRepliesAction: (id: string) => void;
  commentsData: { data: CommentResponse[] } | undefined;
}

export function CommentItem({
  comment,
  depth,
  currentUser,
  noticeCollectionName,
  noticeDocId,
  replyToId,
  setReplyToIdAction,
  editCommentId,
  setEditCommentIdAction,
  expandedReplies,
  toggleRepliesAction,
  commentsData,
}: CommentItemProps) {
  // 댓글 삭제
  const { mutate: deleteComment, isPending: isDeletePending } =
    useDeleteComment(noticeCollectionName, noticeDocId);

  const isEditing = editCommentId === comment.docId;
  const hasReplies =
    comment.childrenComment && comment.childrenComment.length > 0;
  const isRepliesExpanded = expandedReplies.has(comment.docId);
  const isReplyingTo = replyToId === comment.docId;
  const isOwnComment = comment.writeUserDocId === currentUser.docId;

  // AlertDialog 상태 관리
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // 댓글 삭제 핸들러
  const handledeleteCommentAction = useCallback(() => {
    setIsAlertOpen(true);
  }, []);

  // 실제 삭제 처리
  const confirmDelete = useCallback(() => {
    deleteComment(comment.docId, {
      onSuccess: () => {
        toast.success("댓글이 삭제되었습니다.");
      },
      onError: () => {
        toast.error("댓글 삭제에 실패했습니다.");
      },
    });
  }, [deleteComment, comment.docId]);

  // 답글 모드 설정
  const handleReplyTo = useCallback(() => {
    setReplyToIdAction(comment.docId);
    setEditCommentIdAction(null);
  }, [comment.docId, setReplyToIdAction, setEditCommentIdAction]);

  // 수정 모드 설정
  const handleEditMode = useCallback(() => {
    setEditCommentIdAction(comment.docId);
    setReplyToIdAction(null);
  }, [comment.docId, setEditCommentIdAction, setReplyToIdAction]);

  return (
    <motion.div
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
                      onClick={handleReplyTo}
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
                          onClick={handleEditMode}
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" />
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-100/30"
                          onClick={handledeleteCommentAction}
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
                        onClick={() => toggleRepliesAction(comment.docId)}
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
                  <ReplyForm
                    comment={comment}
                    noticeCollectionName={noticeCollectionName}
                    noticeDocId={noticeDocId}
                    currentUser={currentUser}
                    setReplyToIdAction={setReplyToIdAction}
                    onSuccess={() => {
                      // 답글 영역 확장
                      if (!expandedReplies.has(comment.docId)) {
                        toggleRepliesAction(comment.docId);
                      }
                    }}
                  />
                )}
              </AnimatePresence>
            </>
          ) : (
            // 댓글 수정 폼
            <CommentEditForm
              comment={comment}
              noticeCollectionName={noticeCollectionName}
              noticeDocId={noticeDocId}
              currentUser={currentUser}
              setEditCommentIdAction={setEditCommentIdAction}
            />
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 AlertDialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            {comment.childrenComment?.map((reply) => (
              <CommentItem
                key={reply.docId}
                comment={reply}
                depth={depth + 1}
                currentUser={currentUser}
                noticeCollectionName={noticeCollectionName}
                noticeDocId={noticeDocId}
                replyToId={replyToId}
                setReplyToIdAction={setReplyToIdAction}
                editCommentId={editCommentId}
                setEditCommentIdAction={setEditCommentIdAction}
                expandedReplies={expandedReplies}
                toggleRepliesAction={toggleRepliesAction}
                commentsData={commentsData}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
