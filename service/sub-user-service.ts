import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/shared/firestore'
import { SubUser } from '@/shared/types/user'


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
}


// 싱글톤 인스턴스 생성하여 export
export const subUserService = new SubUserService();