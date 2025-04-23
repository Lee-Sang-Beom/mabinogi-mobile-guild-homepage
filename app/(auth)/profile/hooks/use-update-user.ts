import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { profileFormSchema } from '../schema';
import { Session, User } from 'next-auth';
import { ApiResponse } from '@/shared/types/api';
import { userService } from '@/service/user-service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type UpdateUserInput = {
  data: z.infer<typeof profileFormSchema>;
  currentUser: User;
  update: (data: { user: User }) => Promise<Session | null>
};

export function useUpdateUser() {
  const router = useRouter(); // Initialize useRouter

  return useMutation<ApiResponse<string | null>, Error, UpdateUserInput>({
    mutationFn: async ({ data, currentUser, update }) => {
      const response = await userService.updateUser(data, currentUser,update);

      // 실패 시 메시지를 담아 에러 발생시키기
      if (!response.success) {
        throw new Error(response.message || '개인정보 수정 실패');
      }

      return response;
    },
    onSuccess: () => {
      toast.success('사용자 정보가 수정되었습니다.');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || '사용자 정보 수정 중 오류가 발생했습니다.');
    },
  });
}
