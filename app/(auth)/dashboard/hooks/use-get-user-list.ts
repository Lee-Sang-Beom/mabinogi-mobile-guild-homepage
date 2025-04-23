import { useQuery } from '@tanstack/react-query';
import { userService } from '@/service/user-service'
import { User } from 'next-auth';

/**
 * 직업 분포도 데이터 조회용 훅
 */
export const useGetUserList = () => {
  return useQuery<User[] | null>({
    queryKey: ['useGetUserList'],
    queryFn: async () => {
      return await userService.getUsers();
    },
  });
};
