import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import * as z from 'zod';
import { loginFormSchema } from '@/app/(no-auth)/login/schema';
import { toast } from 'sonner';

export async function login(values: z.infer<typeof loginFormSchema>) {
  return await signIn('credentials', {
    ...values,
    redirect: false,
  });
}

export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (res) => {
      if (res?.ok) {
        toast.success('로그인이 완료되었습니다.');
        router.push('/dashboard');
      } else {
        toast.error(res?.error || '로그인에 실패했습니다.');
      }
    },
    onError: (error: unknown) => {
      console.error('Login error:', error);
      toast.error('알 수 없는 오류가 발생했습니다.');
    },
  });
}
