import { ApiResponse } from "@/shared/types/api";
import { encryptPassword, verifyPassword } from "@/shared/utils/utils";
import { Session, User } from "next-auth";
import { z } from "zod";
import { joinFormSchema } from "@/app/(no-auth)/join/schema";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/shared/firestore";
import moment from "moment";
import { forgotPasswordStep1FormSchema } from "@/app/(no-auth)/forgot-password/schema";
import { DashboardJobDistributionResponse } from "@/app/(auth)/dashboard/api";
import { jobTypeOptions } from "@/shared/constants/game";
import { profileFormSchema } from "@/app/(auth)/profile/schema";

class UserService {
  /**
   * @name getUsers
   * @description Firestore에서 유저들을 조회
   */
  async getUsers(): Promise<User[] | null> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "collection_user"),
          where("approvalJoinYn", "==", "Y")
        )
      );

      if (snapshot.empty) return null;

      // 모든 문서를 순회하여 User[] 형태로 반환
      return snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      })) as User[];
    } catch (e) {
      console.error("유저 리스트 조회 중 오류가 발생했습니다. ", e);
      throw new Error("유저 리스트 조회 중 오류가 발생했습니다.");
    }
  }

  /**
   * @name getUnapprovedUsers
   * @description approvalJoinYn이 'N'인 유저들을 조회
   */
  async getUnapprovedUsers(): Promise<User[] | null> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "collection_user"),
          where("approvalJoinYn", "==", "N")
        )
      );

      if (snapshot.empty) return null;

      // 모든 문서를 순회하여 User[] 형태로 반환
      return snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      })) as User[];
    } catch (e) {
      console.error("미승인 유저 조회 중 오류가 발생했습니다. ", e);
      throw new Error("미승인 유저 조회 중 오류가 발생했습니다.");
    }
  }

  /**
   * @name getUserByDocId
   * @description Firestore에서 특정 docId를 가진 유저를 조회
   */
  async getUserByDocId(docId: string): Promise<User | null> {
    try {
      // 🔄 docId로 직접 접근
      const docRef = doc(db, "collection_user", docId);
      const docSnap = await getDoc(docRef);

      // 문서가 없으면 null 반환
      if (!docSnap.exists()) return null;

      // 문서가 있으면 데이터 반환
      return { docId: docSnap.id, ...docSnap.data() } as User;
    } catch (e) {
      console.error("유저의 정보를 조회하는 도중에 오류가 발생했습니다. ", e);
      throw new Error("유저의 정보를 조회하는 도중에 오류가 발생했습니다.");
    }
  }

  /**
   * @name getUserById
   * @description Firestore에서 특정 ID를 가진 유저를 조회
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const snapshot = await getDocs(
        query(collection(db, "collection_user"), where("id", "==", id))
      );

      // 문서가 없으면 null 반환
      if (snapshot.empty) return null;

      // 문서가 있으면 데이터 반환
      const doc = snapshot.docs[0];
      return { docId: doc.id, ...doc.data() } as User;
    } catch (e) {
      console.error("유저의 아이디를 조회하는 도중에 오류가 발생했습니다. ", e);
      throw new Error("유저의 아이디를 조회하는 도중에 오류가 발생했습니다.");
    }
  }

  /**
   * @name getCollectionUserByIdAndPassword
   * @description ID/PW 기반 사용자 인증 처리
   */
  async getCollectionUserByIdAndPassword(
    id: string,
    password: string
  ): Promise<User | null> {
    const user = await this.getUserById(id);
    return user && verifyPassword(password, user.password) ? user : null;
  }

  /**
   * @name checkDuplicateId
   * @param id 유저 ID
   * @description ID가 collection_user 또는 collection_sub_user에 존재하는지 확인
   * @returns 중복 여부 (true = 중복, false = 중복 아님)
   */
  async checkDuplicateId(id: string): Promise<boolean> {
    const checkCollection = async (collectionName: string) => {
      const q = query(collection(db, collectionName), where("id", "==", id));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    };

    try {
      return (
        (await checkCollection("collection_user")) ||
        (await checkCollection("collection_sub_user"))
      );
    } catch (e) {
      console.error("중복된 아이디 검증 중 오류가 발생했습니다. ", e);
      throw new Error("중복된 아이디 검증 중 오류가 발생했습니다.");
    }
  }

  /**
   * @name join
   * @param data 회원가입 유저 정보
   * @description 회원가입
   */
  async join(
    data: z.infer<typeof joinFormSchema>
  ): Promise<ApiResponse<string | null>> {
    try {
      // ID 중복 확인
      if (await this.checkDuplicateId(data.id)) {
        return {
          success: false,
          message: "이미 같은 닉네임을 가진 캐릭터가 존재합니다.",
          data: null,
        };
      }

      // confirmPassword 제외하고 나머지 데이터 추출
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...rest } = data;

      // 비밀번호 암호화 후 필요 데이터 설정
      const userWithEncryptedPassword = {
        ...rest,
        password: encryptPassword(rest.password),
        mngDt: moment().format("YYYY-MM-DD"),
        isHaveEventBadge: "N",
        approvalJoinYn: "N",
      };

      // Firestore에 유저 추가
      const docRef = await addDoc(
        collection(db, "collection_user"),
        userWithEncryptedPassword
      );

      return {
        success: true,
        message:
          "회원가입이 완료되었습니다. 관리자 승인 후 로그인하실 수 있습니다.",
        data: docRef.id,
      };
    } catch (e) {
      console.error("회원가입 중 오류가 발생했습니다. ", e);
      return {
        success: false,
        message: "회원가입 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * @name getCollectionUserByDetails
   * @param data 비밀번호 찾기를 위해 입력한 유저 정보
   * @description 비밀번호 찾기 (실질적 쿼리 발생)
   */
  private async getCollectionUserByDetails(
    data: z.infer<typeof forgotPasswordStep1FormSchema>
  ): Promise<User | null> {
    try {
      const q = query(
        collection(db, "collection_user"),
        where("id", "==", data.id),
        where("job", "==", data.job),
        where("role", "==", data.role),
        where("otp", "==", data.otp)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { docId: doc.id, ...doc.data() } as User;
    } catch (e) {
      console.error(
        "비밀번호 찾기를 위한 대상 유저 조회 중 오류가 발생했습니다.: ",
        e
      );
      throw new Error(
        "비밀번호 찾기를 위한 대상 유저 조회 중 오류가 발생했습니다."
      );
    }
  }

  /**
   * @name findUserForPasswordReset
   * @param values 비밀번호 찾기를 위해 입력한 유저 정보
   * @description 비밀번호 찾기
   */
  async findUserForPasswordReset(
    values: z.infer<typeof forgotPasswordStep1FormSchema>
  ): Promise<ApiResponse<User | null>> {
    try {
      const existingUser = await this.getCollectionUserByDetails(values);
      if (!existingUser) {
        // 동일 유저가 존재하지 않으면, 회원가입조차 안되었다는 뜻
        return {
          success: false,
          message: "조회된 사용자가 없습니다.",
          data: null,
        };
      } else {
        return {
          success: true,
          message:
            "요청한 정보에 대한 사용자가 조회되어, 다음 단계로 이동합니다.",
          data: existingUser,
        };
      }
    } catch (e) {
      console.error("error is ", e);
      return {
        success: false,
        message: "비밀번호 찾기 과정 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * @name changePassword
   * @description 개인정보 중 패스워드를 수정
   * @param password
   * @param user
   */
  async changePassword(
    password: string,
    user: User
  ): Promise<ApiResponse<string | null>> {
    try {
      const { id, job, role, otp } = user;

      // step1: 바꾸려고하는 유저 한번 더 검사
      const existingUser = await this.getCollectionUserByDetails({
        id,
        job,
        role,
        otp,
      });
      if (!existingUser) {
        return {
          success: false,
          message: "현재 변경하기를 희망하는 유저 정보를 찾지 못했습니다.",
          data: null,
        };
      }

      // 업데이트
      const updatedUser = {
        ...user,
        password: encryptPassword(password),
      };
      await updateDoc(
        doc(db, "collection_user", existingUser.docId),
        updatedUser
      );

      return {
        success: true,
        message: "새 비밀번호 설정이 완료되었습니다.",
        data: existingUser.docId,
      };
    } catch (e) {
      console.error("Error modify user: ", e);
      return {
        success: false,
        message: "새 비밀번호를 설정하는 과정에서 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * @name updateUser
   * @param data 변경하기를 원하는 유저 정보
   * @param currentUser 변경 이전 유저 정보
   * @param update next-auth session update
   * @description 개인정보 수정
   */
  async updateUser(
    data: z.infer<typeof profileFormSchema>,
    currentUser: User,
    update: (data: { user: User }) => Promise<Session | null>
  ): Promise<ApiResponse<string | null>> {
    try {
      /**
       * STEP1
       * @description 변경하고자 하는 닉네임을 가진 다른 정보가 DB에 있는지 확인
       * @description 이 때, 내 닉네임은 예외에서 제외해야 함
       */
      if (data.id !== currentUser.id) {
        const isDuplicated = await this.checkDuplicateId(data.id);
        if (isDuplicated) {
          return {
            success: false,
            message: "이미 같은 닉네임을 가진 캐릭터가 존재합니다.",
            data: null,
          };
        }
      }

      /**
       * STEP2
       * @description 새로 덮어쓸 유저정보 추가
       */
      const updatedUser = {
        ...data,
        password:
          data.password && data.password.length > 0
            ? encryptPassword(data.password) // 새 비밀번호 암호화
            : currentUser.password, // 기존 비밀번호 유지

        approvalJoinYn: currentUser.approvalJoinYn,
        isHaveEventBadge: currentUser.isHaveEventBadge,
        mngDt: moment(new Date()).format("YYYY-MM-DD"),
      };

      /**
       * STEP3
       * @description Firestore에서 기존 문서를 업데이트
       */
      const docRef = doc(db, "collection_user", currentUser.docId);
      await updateDoc(docRef, updatedUser);

      /**
       * STEP4
       * @description next-auth session update
       */
      await update({ user: updatedUser });

      return {
        success: true,
        message: "개인정보 수정이 완료되었습니다.",
        data: currentUser.docId,
      };
    } catch (e) {
      console.error("Error adding user: ", e);
      return {
        success: false,
        message: "개인정보 수정 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * @name updateApprovalJoinYn
   * @description 주어진 docId를 가진 유저의 approvalJoinYn을 "Y"로 변경
   * @param docId Firestore 문서 ID
   */
  async updateApprovalJoinYn(
    docId: string
  ): Promise<ApiResponse<string | null>> {
    try {
      // Firestore 문서 참조 생성
      const userDocRef = doc(db, "collection_user", docId);

      // approvalJoinYn 업데이트
      await updateDoc(userDocRef, { approvalJoinYn: "Y" });

      return {
        success: true,
        message: "승인 상태가 정상적으로 변경되었습니다.",
        data: docId,
      };
    } catch (e) {
      console.error("승인 상태 변경 중 오류가 발생했습니다.", e);
      return {
        success: false,
        message: "승인 상태 변경 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * @name withDrawnUser
   * @param user 단일 유저 또는 유저 배열
   * @param type REJECTED: 승인반려용도, WITHDRAWN: 삭제용도
   * @description 개인정보 수정
   */
  async withDrawnUser(
    user: User | User[],
    type: "REJECTED" | "WITHDRAWN"
  ): Promise<ApiResponse<string | null>> {
    // 단일 객체를 배열로 변환
    const users = Array.isArray(user) ? user : [user];

    try {
      // 모든 유저 삭제 처리
      const deletePromises = users.map(async (user) => {
        const userDocRef = doc(db, "collection_user", user.docId);

        // 서브 유저 삭제 - parentDocId가 user.docId인 문서 삭제
        const subUserRef = collection(db, "collection_sub_user");
        const q = query(subUserRef, where("parentDocId", "==", user.docId));
        const querySnapshot = await getDocs(q);

        // 서브 유저 문서가 있으면 삭제
        const subUserDeletePromises = querySnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(subUserDeletePromises);

        // 메인 유저 삭제
        await deleteDoc(userDocRef);
        return userDocRef.id;
      });

      // 모든 삭제가 완료될 때까지 대기
      const deletedIds = await Promise.all(deletePromises);

      return {
        success: true,
        message:
          type === "WITHDRAWN"
            ? "회원탈퇴가 완료되었습니다."
            : "정상적으로 승인요청을 반려했습니다.",
        data: deletedIds.join(", "),
      };
    } catch (error) {
      const msg =
        type === "WITHDRAWN"
          ? "회원탈퇴 요청 중 오류가 발생했습니다."
          : "승인요청 반려 중 오류가 발생했습니다.";

      console.error(msg, error);
      return {
        success: false,
        message: msg,
        data: null,
      };
    }
  }

  /**
   * @name findJobDistributionList
   * @description 직업 별 유저 정보 불러오기 (대표/서브캐릭터 포함)
   * @return DashboardJobDistributionResponse[] | null
   */
  async findJobDistributionList(): Promise<
    DashboardJobDistributionResponse[] | null
  > {
    try {
      // 1. 컬렉션 참조
      const userCollection = collection(db, "collection_user");
      const subUserCollection = collection(db, "collection_sub_user");

      // 2. 병렬로 데이터 조회
      const [userSnapshot, subUserSnapshot] = await Promise.all([
        getDocs(query(userCollection, where("approvalJoinYn", "==", "Y"))),
        getDocs(query(subUserCollection)),
      ]);

      // 3. 직업별 카운트 맵 초기화
      const jobCountMap = jobTypeOptions.reduce<
        Record<string, { representCount: number; subCount: number }>
      >(
        (acc, { value }) => ({
          ...acc,
          [value]: { representCount: 0, subCount: 0 },
        }),
        {}
      );

      // 4. 공통 카운트 함수
      const countJobs = (
        snapshot: typeof userSnapshot,
        type: "representCount" | "subCount"
      ) => {
        snapshot.forEach((doc) => {
          const job = doc.data().job;
          if (job && jobCountMap[job]) {
            jobCountMap[job][type]++;
          }
        });
      };

      // 5. 카운트 처리
      countJobs(userSnapshot, "representCount");
      countJobs(subUserSnapshot, "subCount");

      // 6. 결과 반환
      return Object.entries(jobCountMap).map(
        ([job, { representCount, subCount }]) => ({
          job,
          representCount,
          subCount,
          totalCount: representCount + subCount,
        })
      );
    } catch (error) {
      console.error(
        "직업별 유저 정보를 불러오는 중 에러가 발생했습니다. ",
        error
      );
      return null;
    }
  }
}

// 싱글톤 인스턴스 생성하여 export
export const userService = new UserService();
