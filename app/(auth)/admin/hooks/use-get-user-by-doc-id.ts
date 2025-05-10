import { useQuery } from "@tanstack/react-query";
import { userService } from "@/service/user-service";
import { User } from "next-auth";

/**
 * 단일 유저 조회용 훅 (docId 기준)
 */
export const useGetUserByDocId = (docId: string) => {
  return useQuery<User | null>({
    queryKey: ["useGetUserByDocId", docId],
    queryFn: async () => {
      return await userService.getUserByDocId(docId);
    },
    enabled: !!docId, // docId가 있을 때만 실행
  });
};
