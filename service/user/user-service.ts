import { getUserById } from "@/app/api/userApi";
import { ApiResponse } from "@/shared/types/api";
import { LoginRequest } from "@/shared/types/user";
import { verifyPassword } from "@/shared/utils/utils";
import { User } from "next-auth";

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

    if (existingUser.useYn === "Y") {
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
