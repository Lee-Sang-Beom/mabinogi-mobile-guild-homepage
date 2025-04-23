
import { useMutation } from '@tanstack/react-query';
import { User } from 'next-auth';
import { ApiResponse } from '@/shared/types/api';
import { userService } from '@/service/user-service';
import { toast } from 'sonner';
import { authService } from '@/service/auth-service'
import { useRouter } from 'next/navigation'

type WithDrawnUserInput = {
  user: User;
  type: 'REJECTED' | 'WITHDRAWN';
};

export function useWithdrawnUser() {
  const router = useRouter();

  return useMutation<ApiResponse<string | null>, Error, WithDrawnUserInput>({
    mutationFn: async ({ user, type }) => {
      const response = await userService.withDrawnUser(user, type);
      if (!response.success) {
        throw new Error(response.message || '회원 정보 처리 실패');
      }
      return response;
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.type === 'WITHDRAWN'
          ? '회원 탈퇴가 완료되었습니다.'
          : '승인 요청이 반려되었습니다.'
      );
      authService.logout();
      router.push("/")
    },
    onError: (error, variables) => {
      toast.error(
        error.message ||
        (variables.type === 'WITHDRAWN'
          ? '회원 탈퇴 처리 중 오류가 발생했습니다.'
          : '승인 요청 반려 중 오류가 발생했습니다.')
      );
    },
  });
}
