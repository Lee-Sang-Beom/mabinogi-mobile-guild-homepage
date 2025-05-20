import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/shared/firestore";
import { ApiResponse } from "@/shared/types/api";
import { NoticeResponse } from "@/shared/notice/api";
import { NoticeFormSchema } from "@/shared/notice/schema";
import { commentService } from "@/service/comment-service";

class UpdateService {
  private updateCollection = collection(db, "collection_update");

  // 조회
  async get(): Promise<ApiResponse<NoticeResponse[]>> {
    try {
      const snapshot = await getDocs(this.updateCollection);
      const notices: NoticeResponse[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          docId: docSnap.id,
        } as NoticeResponse;
      });

      // 날짜 문자열을 기준으로 내림차순 정렬 (최신순)
      notices.sort((a, b) => {
        const dateA = new Date(a.mngDt);
        const dateB = new Date(b.mngDt);
        return dateB.getTime() - dateA.getTime(); // 최신순
      });

      return {
        success: true,
        message: "업데이트 목록을 불러왔습니다.",
        data: notices,
      };
    } catch (error) {
      console.error("업데이트 목록 조회 실패:", error);
      return {
        success: false,
        message: "업데이트 목록 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }

  // 특정 업데이트 조회 (docId 기준)
  async getByDocId(docId: string): Promise<ApiResponse<NoticeResponse | null>> {
    try {
      const docRef = doc(db, "collection_update", docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          message: "해당 업데이트 내용을 찾을 수 없습니다.",
          data: null,
        };
      }

      const data = docSnap.data();
      const announcement: NoticeResponse = {
        ...data,
        docId: docSnap.id,
      } as NoticeResponse;

      return {
        success: true,
        message: "업데이트 내용을 성공적으로 불러왔습니다.",
        data: announcement,
      };
    } catch (error) {
      console.error("업데이트 내용 조회 실패:", error);
      return {
        success: false,
        message: "업데이트 내용 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // 최신 내용 1개만 반환
  async getLatest(): Promise<ApiResponse<NoticeResponse | null>> {
    try {
      const snapshot = await getDocs(this.updateCollection);
      const notices: NoticeResponse[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          docId: docSnap.id,
        } as NoticeResponse;
      });

      if (notices.length === 0) {
        return {
          success: true,
          message: "최신 업데이트 내용이 없습니다.",
          data: null,
        };
      }

      // 최신순 정렬 후 첫 번째 항목 반환
      const latestNotice = notices.sort((a, b) => {
        const dateA = new Date(a.mngDt);
        const dateB = new Date(b.mngDt);
        return dateB.getTime() - dateA.getTime(); // 최신순
      })[0];

      return {
        success: true,
        message: "최신 업데이트 내용을 불러왔습니다.",
        data: latestNotice,
      };
    } catch (error) {
      console.error("최신 업데이트 내용 조회 실패:", error);
      return {
        success: false,
        message: "최신 업데이트 내용 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // 생성
  async create(data: NoticeFormSchema): Promise<ApiResponse<string | null>> {
    try {
      const docRef = await addDoc(this.updateCollection, data);
      return {
        success: true,
        message: "업데이트 내용이 성공적으로 생성되었습니다.",
        data: docRef.id,
      };
    } catch (error) {
      console.error("업데이트 내용 생성 실패:", error);
      return {
        success: false,
        message: "업데이트 내용 생성 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // 업데이트
  async update(
    docId: string,
    data: NoticeFormSchema,
  ): Promise<ApiResponse<string | null>> {
    try {
      const docRef = doc(db, "collection_update", docId);
      await updateDoc(docRef, data);
      return {
        success: true,
        message: "업데이트 내용이 성공적으로 수정되었습니다.",
        data: docId,
      };
    } catch (error) {
      console.error("업데이트 내용 수정 실패:", error);
      return {
        success: false,
        message: "업데이트 내용 수정 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // 삭제
  async delete(docIds: string | string[]): Promise<ApiResponse<string[]>> {
    const ids = Array.isArray(docIds) ? docIds : [docIds];

    try {
      await Promise.all(
        ids.map(async (id) => {
          // 먼저 연결된 댓글 전체 삭제
          await commentService.deleteAllComments(
            "collection_update_comment",
            id,
          );

          const docRef = doc(db, "collection_update", id);
          return deleteDoc(docRef);
        }),
      );

      return {
        success: true,
        message: `${ids.length}개의 업데이트 내용이 성공적으로 삭제되었습니다.`,
        data: ids,
      };
    } catch (error) {
      console.error("업데이트 내용 삭제 실패:", error);
      return {
        success: false,
        message: "업데이트 내용 삭제 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }
}

export const updateService = new UpdateService();
