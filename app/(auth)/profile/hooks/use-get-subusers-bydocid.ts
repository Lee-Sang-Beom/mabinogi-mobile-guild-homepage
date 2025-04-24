import { useQuery } from '@tanstack/react-query';
import { SubUser } from '@/shared/types/user';
import { subUserService } from '@/service/sub-user-service' // 타입 경로에 따라 수정

export const useGetSubusersBydocId = (docId: string) => {
  return useQuery<SubUser[] | null>({
    queryKey: ['useGetSubusersBydocId', docId],
    queryFn: () => subUserService.getSubUsersByDocId(docId),
    enabled: !!docId, // docId가 있을 때만 실행
  });
};
