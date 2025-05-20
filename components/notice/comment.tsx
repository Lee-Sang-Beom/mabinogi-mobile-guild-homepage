"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { NoticeCommentProps } from "@/shared/notice/internal";
import { CommentResponse } from "@/shared/notice/api";
import { useGetCommentAll } from "@/shared/notice/hooks/use-get-comment-all";
import { AnimatedLoading } from "@/components/animated-loading";
import { CommentItem } from "./comment-item";
import { CommentForm } from "./comment-form";

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

  // 새 댓글이 작성되면 해당 위치로 스크롤
  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

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

        {/* 새 댓글 작성 폼 */}
        <CommentForm
          noticeCollectionName={noticeCollectionName}
          noticeDocId={noticeDocId}
          currentUser={currentUser}
          onSuccess={scrollToEnd}
        />

        {isPending ? (
          <div className="flex justify-center py-8">
            <AnimatedLoading />
          </div>
        ) : commentsData?.data && commentsData.data.length > 0 ? (
          <div className="space-y-4">
            {commentsData.data.map((comment: CommentResponse) => (
              <CommentItem
                key={comment.docId}
                comment={comment}
                depth={0}
                currentUser={currentUser}
                noticeCollectionName={noticeCollectionName}
                noticeDocId={noticeDocId}
                replyToId={replyToId}
                setReplyToIdAction={setReplyToId}
                editCommentId={editCommentId}
                setEditCommentIdAction={setEditCommentId}
                expandedReplies={expandedReplies}
                toggleRepliesAction={toggleReplies}
                commentsData={commentsData}
              />
            ))}
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
