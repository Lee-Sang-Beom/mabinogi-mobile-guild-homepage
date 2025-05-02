import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/shared/firestore'
import { SubUser } from '@/shared/types/user'
import * as z from 'zod'
import { subUsersFormSchema } from '@/app/(auth)/profile/schema'
import { ApiResponse } from '@/shared/types/api'
import { userService } from '@/service/user-service'


class SubUserService {

  /**
   * @name getSubUsers
   * @description Firestore에서 서브유저들을 조회
   */
  async getSubUsers(): Promise<SubUser[] | null> {
    try {
      const snapshot = await getDocs(
        query(collection(db, "collection_sub_user"))
      );

      if (snapshot.empty) return null;

      // 모든 문서를 순회하여 User[] 형태로 반환
      return snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      })) as SubUser[];
    } catch (e) {
      console.error("서브유저 리스트 조회 중 오류가 발생했습니다. ", e);
      throw new Error("서브유저 리스트 조회 중 오류가 발생했습니다.");
    }
  }

  /**
   * @name getSubUsersById
   * @description Firestore에서 특정 id를 가지는 유저가 있는지 조회
   */
  async getSubUsersById(id: string): Promise<SubUser | null> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "collection_sub_user"),
          where("id", "==", id)
        )
      );

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        docId: doc.id,
        ...doc.data(),
      } as SubUser;
    } catch (e) {
      console.error("서브유저 리스트 조회 중 오류가 발생했습니다. ", e);
      throw new Error("서브유저 리스트 조회 중 오류가 발생했습니다.");
    }
  }

  /**
   * @name getSubUsersByDocId
   * @description Firestore에서 특정 user의 docId를 parentDocId로 가지는 collection_sub_user 콜렉션 내 서브유저들을 조회
   */
  async getSubUsersByDocId(docId: string): Promise<SubUser[] | null> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "collection_sub_user"),
          where("parentDocId", "==", docId)
        )
      );

      if (snapshot.empty) return null;

      return snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      })) as SubUser[];
    } catch (e) {
      console.error("서브유저 리스트 조회 중 오류가 발생했습니다. ", e);
      throw new Error("서브유저 리스트 조회 중 오류가 발생했습니다.");
    }
  }

  /**
   * @name createSubUser
   * @description 서브유저 추가
   */
  async createSubUser (values: z.infer<typeof subUsersFormSchema>):Promise<ApiResponse<string | null>> {
    try {
      // ID 중복 확인
      if (await userService.checkDuplicateId(values.id)) {
        return {
          success: false,
          message: "이미 같은 닉네임을 가진 캐릭터가 존재합니다.",
          data: null,
        };
      }

      // Firestore에 유저 추가 (sub_users 컬렉션에 추가)
      const subUserRef = collection(db, "collection_sub_user");

      // 서브캐릭터 추가
      const docRef = await addDoc(subUserRef, {
        ...values,
      });

      return {
        success: true,
        message: "서브캐릭터가 추가되었습니다.",
        data: docRef.id,
      };
    } catch (e) {
      console.error("서브캐릭터 추가 중 오류가 발생했습니다. ", e);
      return {
        success: false,
        message: "서브캐릭터 추가 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * @name deleteSubUser
   * @description 서브유저 삭제
   */
  async deleteSubUser (docId:string):Promise<ApiResponse<string | null>> {
    try {
      const docRef = doc(db, 'collection_sub_user', docId);
      await deleteDoc(docRef);

      return {
        success: true,
        message: '서브캐릭터가 삭제되었습니다.',
        data: docId,
      };
    } catch (error) {
      console.error('서브캐릭터 삭제 중 오류 발생:', error);
      return {
        success: false,
        message: '서브캐릭터 삭제 중 오류가 발생했습니다.',
        data: null,
      };
    }
  }
}


// 싱글톤 인스턴스 생성하여 export
export const subUserService = new SubUserService();