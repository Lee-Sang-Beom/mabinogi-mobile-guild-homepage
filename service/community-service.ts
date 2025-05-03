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
import { CommunityNoticeType } from "@/shared/notice/internal";

class CommunityService {
  private getCollectionByType(type: CommunityNoticeType) {
    switch (type) {
      case "artwork":
        return collection(db, "collection_artwork");
      case "tips":
        return collection(db, "collection_tip");
      default:
        throw new Error("잘못된 타입입니다.");
    }
  }

  getCollectionTypeTabName(type: CommunityNoticeType) {
    switch (type) {
      case "artwork":
        return "아트워크";
      case "tips":
        return "정보(팁)";
      default:
        return "커뮤니티";
    }
  }

  // 조회
  async get(type: CommunityNoticeType): Promise<ApiResponse<NoticeResponse[]>> {
    try {
      const targetCollection = this.getCollectionByType(type);
      const snapshot = await getDocs(targetCollection);
      const notices: NoticeResponse[] = snapshot.docs.map(
        (docSnap) =>
          ({
            ...docSnap.data(),
            docId: docSnap.id,
          }) as NoticeResponse
      );

      notices.sort(
        (a, b) => new Date(b.mngDt).getTime() - new Date(a.mngDt).getTime()
      );

      return {
        success: true,
        message: `${this.getCollectionTypeTabName(type)} 목록을 불러왔습니다.`,
        data: notices,
      };
    } catch (error) {
      console.error("목록 조회 실패:", error);
      return {
        success: false,
        message: `${this.getCollectionTypeTabName(type)} 목록 조회 중 오류가 발생했습니다.`,
        data: [],
      };
    }
  }

  // 특정 커뮤니티 조회 (docId 기준)
  async getByDocId(
    type: CommunityNoticeType,
    docId: string
  ): Promise<ApiResponse<NoticeResponse | null>> {
    try {
      const targetCollection = this.getCollectionByType(type);
      const docRef = doc(targetCollection, docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          message: `${this.getCollectionTypeTabName(type)} 내용을 찾을 수 없습니다.`,
          data: null,
        };
      }

      return {
        success: true,
        message: `${this.getCollectionTypeTabName(type)} 내용을 성공적으로 불러왔습니다.`,
        data: {
          ...docSnap.data(),
          docId: docSnap.id,
        } as NoticeResponse,
      };
    } catch (error) {
      console.error("내용 조회 실패:", error);
      return {
        success: false,
        message: `${this.getCollectionTypeTabName(type)} 내용 조회 중 오류가 발생했습니다.`,
        data: null,
      };
    }
  }

  // 생성
  async create(
    type: CommunityNoticeType,
    data: NoticeFormSchema
  ): Promise<ApiResponse<string | null>> {
    try {
      const targetCollection = this.getCollectionByType(type);
      const docRef = await addDoc(targetCollection, data);
      return {
        success: true,
        message: `${this.getCollectionTypeTabName(type)} 내용이 성공적으로 생성되었습니다.`,
        data: docRef.id,
      };
    } catch (error) {
      console.error("내용 생성 실패:", error);
      return {
        success: false,
        message: `${this.getCollectionTypeTabName(type)} 내용 생성 중 오류가 발생했습니다.`,
        data: null,
      };
    }
  }

  // 업데이트
  async update(
    type: CommunityNoticeType,
    docId: string,
    data: NoticeFormSchema
  ): Promise<ApiResponse<string | null>> {
    try {
      const targetCollection = this.getCollectionByType(type);
      const docRef = doc(targetCollection, docId);
      await updateDoc(docRef, data);
      return {
        success: true,
        message: `${this.getCollectionTypeTabName(type)} 내용이 성공적으로 수정되었습니다.`,
        data: docId,
      };
    } catch (error) {
      console.error("내용 수정 실패:", error);
      return {
        success: false,
        message: `${this.getCollectionTypeTabName(type)} 내용 수정 중 오류가 발생했습니다.`,
        data: null,
      };
    }
  }

  // 삭제
  async delete(
    type: CommunityNoticeType,
    docIds: string | string[]
  ): Promise<ApiResponse<string[]>> {
    const ids = Array.isArray(docIds) ? docIds : [docIds];

    try {
      const targetCollection = this.getCollectionByType(type);
      await Promise.all(
        ids.map((id) => {
          const docRef = doc(targetCollection, id);
          return deleteDoc(docRef);
        })
      );

      return {
        success: true,
        message: `${this.getCollectionTypeTabName(type)} ${ids.length}개의 내용이 성공적으로 삭제되었습니다.`,
        data: ids,
      };
    } catch (error) {
      console.error("내용 삭제 실패:", error);
      return {
        success: false,
        message: `${this.getCollectionTypeTabName(type)} 내용 삭제 중 오류가 발생했습니다.`,
        data: [],
      };
    }
  }
}

export const communityService = new CommunityService();
