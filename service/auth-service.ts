import { LoginRequest } from '@/app/(no-auth)/login/api'
import { ApiResponse } from '@/shared/types/api'
import { User } from 'next-auth'
import { userService } from '@/service/user-service'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { clearCache } from '@/shared/utils/utils'

class AuthService {
  /**
   * @name login
   * @description 로그인 처리 (비즈니스 로직)
   */
  async login(data: LoginRequest): Promise<ApiResponse<User | null>> {
    try {
      const existingUser = await userService.getCollectionUserByIdAndPassword(
        data.id,
        data.password
      );

      if (!existingUser) return { success: false, message: "닉네임과 비밀번호를 다시 확인해주세요.", data: null };

      return existingUser.approvalJoinYn === "Y"
        ? { success: true, message: "로그인이 성공하였습니다.", data: existingUser }
        : { success: false, message: "로그인이 승인된 길드원이 아닙니다. 길드 관리자에게 문의해주세요.", data: null };

    } catch (e) {
      console.error("로그인 중 오류 발생: ", e);
      return { success: false, message: "로그인 중 오류가 발생했습니다.", data: null };
    }
  }

  /**
   * @name logout
   * @description 로그아웃 처리 (비즈니스 로직)
   */
  async logout() {
    await signOut({ redirect: false });
    toast.success("로그아웃이 완료되었습니다.");
    clearCache();
  }
}

export const authService = new AuthService();
