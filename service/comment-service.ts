import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
} from "firebase/firestore";
import moment from "moment";

import { db } from "@/shared/firestore";
import { CommentRequest, CommentResponse } from "@/shared/notice/api";
import { CommentNoticeCollectionName } from "@/shared/notice/internal";
import { ApiResponse } from "@/shared/types/api";

class CommentService {
  /**
   * 댓글 생성 또는 수정 (Upsert)
   */
  async upsert(input: CommentRequest): Promise<ApiResponse<null>> {
    try {
      const {
        docId,
        noticeCollectionName,
        noticeDocId,
        content,
        writeUserDocId,
        writeUserId,
        parentCommentDocId,
        regDt,
      } = input;

      const isNew = !docId;
      const commentId = docId ?? crypto.randomUUID();

      const commentRef = doc(
        db,
        noticeCollectionName,
        noticeDocId,
        "comments",
        commentId,
      );

      const nowFormatted = moment().format("YYYY-MM-DD HH:mm:ss");

      await setDoc(commentRef, {
        docId: commentId,
        noticeCollectionName,
        noticeDocId,
        content,
        regDt: isNew ? nowFormatted : regDt,
        modifyDt: nowFormatted,
        writeUserDocId,
        writeUserId,
        parentCommentDocId: parentCommentDocId ?? null,
      });

      return {
        success: true,
        message: isNew ? "댓글이 등록되었습니다." : "댓글이 수정되었습니다.",
        data: null,
      };
    } catch (error) {
      console.error("댓글 저장 실패:", error);
      return {
        success: false,
        message: "댓글 저장 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * 댓글 삭제
   */
  async delete(
    noticeCollectionName: CommentNoticeCollectionName,
    noticeDocId: string,
    commentDocId: string,
  ): Promise<ApiResponse<null>> {
    try {
      // 1. 자식 댓글들 찾기
      const commentsRef = collection(
        db,
        noticeCollectionName,
        noticeDocId,
        "comments",
      );

      const snapshot = await getDocs(query(commentsRef));
      const childComments: string[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.parentCommentDocId === commentDocId) {
          childComments.push(data.docId);
        }
      });

      // 2. 자식 댓글들을 먼저 삭제 (재귀적으로)
      for (const childDocId of childComments) {
        await this.delete(noticeCollectionName, noticeDocId, childDocId);
      }

      // 3. 최종적으로 자기 자신 삭제
      const commentRef = doc(
        db,
        noticeCollectionName,
        noticeDocId,
        "comments",
        commentDocId,
      );
      await deleteDoc(commentRef);

      return {
        success: true,
        message: "댓글이 삭제되었습니다.",
        data: null,
      };
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      return {
        success: false,
        message: "댓글 삭제 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * 댓글 전체 삭제
   */
  async deleteAllComments(
    noticeCollectionName: CommentNoticeCollectionName,
    noticeDocId: string,
  ) {
    const commentsRef = collection(
      db,
      noticeCollectionName,
      noticeDocId,
      "comments",
    );

    const snapshot = await getDocs(query(commentsRef));

    const deletePromises: Promise<ApiResponse<null>>[] = [];

    snapshot.forEach((docSnap) => {
      const commentId = docSnap.id;
      deletePromises.push(
        commentService.delete(noticeCollectionName, noticeDocId, commentId),
      );
    });

    await Promise.all(deletePromises);
  }

  /**
   * 댓글 단건 조회
   */
  async getById(
    noticeCollectionName: CommentNoticeCollectionName,
    noticeDocId: string,
    commentDocId: string,
  ): Promise<ApiResponse<CommentResponse | null>> {
    try {
      const commentRef = doc(
        db,
        noticeCollectionName,
        noticeDocId,
        "comments",
        commentDocId,
      );
      const snapshot = await getDoc(commentRef);

      if (!snapshot.exists()) {
        return {
          success: false,
          message: "해당 댓글을 찾을 수 없습니다.",
          data: null,
        };
      }

      const data = snapshot.data();

      return {
        success: true,
        message: "댓글을 성공적으로 조회했습니다.",
        data: {
          docId: data.docId,
          noticeCollectionName: data.noticeCollectionName,
          noticeDocId: data.noticeDocId,
          content: data.content,
          regDt: data.regDt,
          modifyDt: data.modifyDt,
          writeUserDocId: data.writeUserDocId,
          writeUserId: data.writeUserId,
          parentCommentDocId: data.parentCommentDocId ?? null,
          childrenComment: null,
        },
      };
    } catch (error) {
      console.error("댓글 단건 조회 실패:", error);
      return {
        success: false,
        message: "댓글 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * 댓글 전체 조회 (트리 구조로 반환)
   */
  async getAll(
    noticeCollectionName: CommentNoticeCollectionName,
    noticeDocId: string,
  ): Promise<ApiResponse<CommentResponse[]>> {
    try {
      const commentsRef = collection(
        db,
        noticeCollectionName,
        noticeDocId,
        "comments",
      );

      const snapshot = await getDocs(query(commentsRef));
      const allComments: CommentResponse[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        allComments.push({
          docId: data.docId,
          noticeCollectionName: data.noticeCollectionName,
          noticeDocId: data.noticeDocId,
          content: data.content,
          regDt: data.regDt,
          modifyDt: data.modifyDt,
          writeUserDocId: data.writeUserDocId,
          writeUserId: data.writeUserId,
          parentCommentDocId: data.parentCommentDocId ?? null,
          childrenComment: null,
        });
      });

      // 트리 구조로 변환
      const map = new Map<string, CommentResponse>();
      allComments.forEach((c) =>
        map.set(c.docId, { ...c, childrenComment: [] }),
      );

      const nestedComments: CommentResponse[] = [];

      allComments.forEach((comment) => {
        if (comment.parentCommentDocId) {
          const parent = map.get(comment.parentCommentDocId);
          if (parent) {
            parent.childrenComment = parent.childrenComment || [];
            parent.childrenComment.push(map.get(comment.docId)!);
          }
        } else {
          nestedComments.push(map.get(comment.docId)!);
        }
      });

      return {
        success: true,
        message: "댓글 목록을 불러왔습니다.",
        data: nestedComments,
      };
    } catch (error) {
      console.error("댓글 전체 조회 실패:", error);
      return {
        success: false,
        message: "댓글 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }
}

export const commentService = new CommentService();
