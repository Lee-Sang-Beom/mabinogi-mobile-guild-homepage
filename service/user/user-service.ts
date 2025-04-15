import { getUserById } from "@/app/api/userApi";
import { ApiResponse } from "@/shared/types/api";
import { LoginRequest } from "@/app/(no-auth)/login/types";
import { encryptPassword, verifyPassword } from "@/shared/utils/utils";
import { User } from "next-auth";
import { z } from "zod";
import { joinFormSchema } from "@/app/(no-auth)/join/schema";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/shared/firestore";
import moment from "moment";
/**
 * @name loginCollectionUser
 * @description 로그인 처리 (비즈니스 로직)
 */
export async function loginCollectionUser(
  data: LoginRequest
): Promise<ApiResponse<User | null>> {
  try {
    const existingUser = await getCollectionUserByIdAndPassword(
      data.id,
      data.password
    );

    if (!existingUser) {
      return {
        success: false,
        message: "닉네임과 비밀번호를 다시 확인해주세요.",
        data: null,
      };
    }

    if (existingUser.approvalJoinYn === "Y") {
      return {
        success: true,
        message: "로그인이 성공하였습니다.",
        data: existingUser,
      };
    } else {
      return {
        success: false,
        message:
          "로그인이 승인된 문파원이 아닙니다. 문파 관리자에게 문의해주세요.",
        data: null,
      };
    }
  } catch (e) {
    console.error("Login error: ", e);
    return {
      success: false,
      message: "로그인 중 오류가 발생했습니다.",
      data: null,
    };
  }
}

/**
 * @name getCollectionUserByIdAndPassword
 * @description ID/PW 기반 사용자 인증 처리
 */
export async function getCollectionUserByIdAndPassword(
  id: string,
  password: string
): Promise<User | null> {
  const userData = await getUserById(id);
  if (!userData) return null;

  const isPasswordMatch = verifyPassword(password, userData.password);
  return isPasswordMatch ? userData : null;
}

/**
 * @name checkDuplicateId
 * @param id 유저 ID
 * @description ID가 collection_user 또는 collection_sub_user에 존재하는지 확인
 * @returns 중복 여부 (true = 중복, false = 중복 아님)
 */
export async function checkDuplicateId(id: string): Promise<boolean> {
  try {
    const userQuery = query(
      collection(db, "collection_user"),
      where("id", "==", id)
    );
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      return true; // collection_user에 동일한 ID가 존재
    }

    // collection_sub_user에서 ID 검색
    const subUserQuery = query(
      collection(db, "collection_sub_user"),
      where("id", "==", id)
    );
    const subUserSnapshot = await getDocs(subUserQuery);

    if (!subUserSnapshot.empty) {
      return true; // collection_sub_user에 동일한 ID가 존재
    }

    return false; // 중복된 ID가 없음
  } catch (e) {
    console.error("Error checking duplicate ID: ", e);
    throw new Error("Failed to check duplicate ID");
  }
}

/**
 * @name addCollectionUser
 * @param data 회원가입 유저 정보
 * @description 회원가입
 */
export async function addCollectionUser(
  data: z.infer<typeof joinFormSchema>
): Promise<ApiResponse<string | null>> {
  try {
    const isDuplicate = await checkDuplicateId(data.id);

    // 동일한 ID가 존재하면 예외 발생
    if (isDuplicate) {
      return {
        success: false,
        message: "이미 같은 닉네임을 가진 회원이 존재합니다.",
        data: null,
      };
    }

    const { confirmPassword, ...rest } = data;
    // 비밀번호 암호화 후 필요 데이터 삽입
    const userWithEncryptedPassword = {
      ...rest,
      password: encryptPassword(rest.password),
      mngDt: moment(new Date()).format("YYYY-MM-DD"),
      isHaveEventBadge: "N",
      approvalJoinYn: "N",
    };

    // Firestore에 새로운 유저 추가
    const docRef = await addDoc(
      collection(db, "collection_user"),
      userWithEncryptedPassword
    );

    return {
      success: true,
      message: "회원가입이 완료되었습니다.",
      data: docRef.id,
    };
  } catch (e) {
    console.error("Error adding user: ", e);
    return {
      success: false,
      message: "회원가입 중 오류가 발생했습니다.",
      data: null,
    };
  }
}
