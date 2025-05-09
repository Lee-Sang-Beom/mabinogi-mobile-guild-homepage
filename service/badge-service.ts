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
import { BadgeResponse } from "@/app/(auth)/hub/api";
import { BadgeFormSchemaType } from "@/app/(auth)/hub/schema";

// 🔖 컬렉션 상수
const BADGE_COLLECTION = collection(db, "collection_badge");

class BadgeService {
  // 📝 뱃지 목록 조회
  async getAll(): Promise<ApiResponse<BadgeResponse[]>> {
    try {
      const snapshot = await getDocs(BADGE_COLLECTION);
      const badges: BadgeResponse[] = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        docId: docSnap.id,
      })) as BadgeResponse[];

      return {
        success: true,
        message: "뱃지 목록을 불러왔습니다.",
        data: badges,
      };
    } catch (error) {
      console.error("뱃지 목록 조회 실패:", error);
      return {
        success: false,
        message: "뱃지 목록 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }

  // 📝 특정 뱃지 조회 (docId 기준)
  async getByDocId(docId: string): Promise<ApiResponse<BadgeResponse | null>> {
    try {
      const docRef = doc(BADGE_COLLECTION, docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          message: "등록된 뱃지를 찾을 수 없습니다.",
          data: null,
        };
      }

      return {
        success: true,
        message: "뱃지를 성공적으로 불러왔습니다.",
        data: {
          ...docSnap.data(),
          docId: docSnap.id,
        } as BadgeResponse,
      };
    } catch (error) {
      console.error("뱃지 조회 실패:", error);
      return {
        success: false,
        message: "뱃지 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // ➕ 뱃지 생성
  async create(
    badge: BadgeFormSchemaType,
  ): Promise<ApiResponse<string | null>> {
    try {
      const docRef = await addDoc(BADGE_COLLECTION, badge);
      return {
        success: true,
        message: "뱃지가 성공적으로 생성되었습니다.",
        data: docRef.id,
      };
    } catch (error) {
      console.error("뱃지 생성 실패:", error);
      return {
        success: false,
        message: "뱃지 생성 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // 📝 뱃지 수정
  async update(
    docId: string,
    badge: BadgeFormSchemaType,
  ): Promise<ApiResponse<string | null>> {
    try {
      const docRef = doc(BADGE_COLLECTION, docId);
      await updateDoc(docRef, badge);
      return {
        success: true,
        message: "뱃지가 성공적으로 수정되었습니다.",
        data: docId,
      };
    } catch (error) {
      console.error("뱃지 수정 실패:", error);
      return {
        success: false,
        message: "뱃지 수정 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // ❌ 뱃지 삭제
  async delete(docId: string): Promise<ApiResponse<string>> {
    try {
      const docRef = doc(BADGE_COLLECTION, docId);
      await deleteDoc(docRef);
      return {
        success: true,
        message: "뱃지가 성공적으로 삭제되었습니다.",
        data: docId,
      };
    } catch (error) {
      console.error("뱃지 삭제 실패:", error);
      return {
        success: false,
        message: "뱃지 삭제 중 오류가 발생했습니다.",
        data: "",
      };
    }
  }
}

// 📦 BadgeService 인스턴스 생성 (싱글톤)
export const badgeService = new BadgeService();
