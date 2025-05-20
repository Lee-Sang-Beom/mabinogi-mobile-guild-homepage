import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/shared/firestore";
import { ApiResponse } from "@/shared/types/api";
import { User } from "next-auth";
import { BadgeResponse } from "@/app/(auth)/hub/api";
import {
  CreateUserBadgeCollectionType,
  UserBadgeCollectionType,
  UserBadgeCountResponse,
  UserBadgeResponse,
} from "@/app/(auth)/(admin)/admin-badge/api";

const USER_COLLECTION = collection(db, "collection_user");
const BADGE_COLLECTION = collection(db, "collection_badge");
const USER_BADGE_COLLECTION = collection(db, "collection_user_badge");

class UserBadgeService {
  /**
   * 🔍 특정 유저의 뱃지 목록 조회 (userDocId 기준)
   *
   * @param userDocId - 조회할 유저의 문서 ID
   * @returns 해당 유저의 뱃지 목록 (유저 정보와 뱃지 정보 포함)
   */
  async getUserBadgesByUserDocId(
    userDocId: string,
  ): Promise<ApiResponse<UserBadgeResponse | null>> {
    try {
      const q = query(
        USER_BADGE_COLLECTION,
        where("userDocId", "==", userDocId),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return {
          success: false,
          message: "해당 유저의 뱃지 정보를 찾을 수 없습니다.",
          data: null,
        };
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data() as UserBadgeCollectionType;

      // 유저 정보 조회 (userDocId를 사용)
      const userDoc = await getDoc(doc(USER_COLLECTION, data.userDocId));
      if (!userDoc.exists()) {
        return {
          success: false,
          message: "유저 정보를 찾을 수 없습니다.",
          data: null,
        };
      }
      const user = userDoc.data() as User;

      // 뱃지 정보 조회
      const badges: BadgeResponse[] = [];
      for (const badgeDocId of data.badgeDocIds) {
        const badgeDoc = await getDoc(doc(BADGE_COLLECTION, badgeDocId));
        if (badgeDoc.exists()) {
          badges.push({
            ...badgeDoc.data(),
            docId: badgeDoc.id,
          } as BadgeResponse);
        }
      }

      return {
        success: true,
        message: "해당 유저의 뱃지 정보를 불러왔습니다.",
        data: {
          docId: docSnap.id,
          user,
          badges,
        },
      };
    } catch (error) {
      console.error("유저 뱃지 조회 실패:", error);
      return {
        success: false,
        message: "유저 뱃지 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * 🔢 모든 유저의 뱃지 개수 조회
   *
   * @returns 유저 ID와 뱃지 개수 리스트
   */
  async getAllUserBadgeCounts(): Promise<
    ApiResponse<UserBadgeCountResponse[]>
  > {
    try {
      const snapshot = await getDocs(USER_BADGE_COLLECTION);

      if (snapshot.empty) {
        return {
          success: false,
          message: "유저 뱃지 정보가 없습니다.",
          data: [],
        };
      }

      const result: UserBadgeCountResponse[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as UserBadgeCollectionType;
        const userDocRef = doc(USER_COLLECTION, data.userDocId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.warn(`유저 문서(${data.userDocId})가 존재하지 않음`);
          continue; // 유저 정보 없으면 skip
        }

        const user = userDocSnap.data() as User;

        result.push({
          userDocId: data.userDocId,
          badgeCount: data.badgeDocIds.length,
          user,
        });
      }

      return {
        success: true,
        message: "유저 뱃지 개수 및 유저 정보를 성공적으로 불러왔습니다.",
        data: result,
      };
    } catch (error) {
      console.error("유저 뱃지 개수 조회 실패:", error);
      return {
        success: false,
        message: "유저 뱃지 개수 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }

  /**
   * ➕ 유저 뱃지 추가
   *
   * @param data - 추가할 유저 뱃지 데이터
   * @returns 추가된 유저 뱃지의 문서 ID
   */
  async createUserBadge(
    data: CreateUserBadgeCollectionType,
  ): Promise<ApiResponse<string | null>> {
    try {
      // 새 뱃지 추가
      const docRef = await addDoc(USER_BADGE_COLLECTION, data);
      return {
        success: true,
        message: "해당 길드원에게 뱃지를 수여하던 중 문제가 발생했습니다.",
        data: docRef.id,
      };
    } catch (error) {
      console.error(
        "해당 길드원에게 뱃지를 수여하던 중 문제가 발생했습니다. ",
        error,
      );
      return {
        success: false,
        message: "해당 길드원에게 뱃지를 수여하던 중 문제가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * 🔄 유저 뱃지 수정
   *
   * @param docId - 수정할 유저 뱃지의 문서 ID
   * @param data - 수정할 유저 뱃지 데이터
   * @param appendBadgeDocId - 추가하고자하는 뱃지정보
   * @returns 수정된 유저 뱃지의 문서 ID
   */
  async updateUserBadge(
    docId: string,
    data: Partial<UserBadgeCollectionType>,
    appendBadgeDocId: string,
  ): Promise<ApiResponse<string | null>> {
    try {
      // 수정하려는 유저 뱃지 데이터 조회
      const docRef = doc(USER_BADGE_COLLECTION, docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists() || !data.userDocId) {
        return {
          success: false,
          message: "수정하려는 뱃지 정보가 존재하지 않습니다.",
          data: null,
        };
      }

      // 유저의 기존 뱃지 목록 조회
      const existingBadge = await this.getUserBadgesByUserDocId(data.userDocId);

      if (!existingBadge.success || !existingBadge.data) {
        return {
          success: false,
          message: "유저의 기존 뱃지 정보를 불러오는 데 실패했습니다.",
          data: null,
        };
      }

      // 중복 검사
      const isDuplicate = existingBadge.data.badges.some(
        (badge) => badge.docId === appendBadgeDocId,
      );

      if (isDuplicate) {
        return {
          success: false,
          message: "해당 길드원은 이미 이 뱃지를 보유하고 있습니다.",
          data: null,
        };
      }

      // 뱃지 수정
      await updateDoc(docRef, data);

      return {
        success: true,
        message: "해당 길드원에게 뱃지를 수여했습니다.",
        data: docId,
      };
    } catch (error) {
      console.error(
        "해당 길드원에게 뱃지를 수여하던 중 문제가 발생했습니다.",
        error,
      );
      return {
        success: false,
        message: "해당 길드원에게 뱃지를 수여하던 중 문제가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * ➖ 유저 뱃지 제거
   *
   * @param userDocId - 유저의 문서 ID
   * @param deleteBadgeDocId - 제거할 뱃지의 문서 ID
   * @returns 수정된 유저 뱃지의 문서 ID
   */
  async deleteUserBadge(
    userDocId: string,
    deleteBadgeDocId: string,
  ): Promise<ApiResponse<string | null>> {
    try {
      // deleteBadgeDocId가 undefined일 경우 처리
      if (!deleteBadgeDocId) {
        return {
          success: false,
          message: "삭제할 뱃지의 ID가 유효하지 않습니다.",
          data: null,
        };
      }

      // 유저의 뱃지 문서 조회
      const q = query(
        USER_BADGE_COLLECTION,
        where("userDocId", "==", userDocId),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return {
          success: false,
          message: "해당 유저의 뱃지 정보를 찾을 수 없습니다.",
          data: null,
        };
      }

      // 유저의 뱃지 문서 가져오기
      const docSnap = snapshot.docs[0];
      const data = docSnap.data() as UserBadgeCollectionType;

      // 기존 뱃지 목록에서 삭제할 뱃지 제거
      const updatedBadgeDocIds = data.badgeDocIds.filter(
        (badgeDocId) => badgeDocId !== deleteBadgeDocId,
      );

      // 뱃지 목록이 변경되지 않은 경우
      if (updatedBadgeDocIds.length === data.badgeDocIds.length) {
        return {
          success: false,
          message: "해당 유저는 지정된 뱃지를 보유하고 있지 않습니다.",
          data: null,
        };
      }

      // 유저의 뱃지 문서 업데이트 (빈 배열이 되면 빈 배열로 저장)
      await updateDoc(docSnap.ref, { badgeDocIds: updatedBadgeDocIds });

      return {
        success: true,
        message: "뱃지가 성공적으로 제거되었습니다.",
        data: docSnap.id,
      };
    } catch (error) {
      console.error("유저 뱃지 제거 실패:", error);
      return {
        success: false,
        message: "유저 뱃지 제거 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }
}

// 📦 UserBadgeService 인스턴스 생성 (싱글톤)
export const userBadgeService = new UserBadgeService();
