import { useQuery } from "@tanstack/react-query";
import { userService } from "@/service/user-service";
import { User } from "next-auth";

/**
 * 미승인 유저 목록 조회용 훅
 */
export const useGetUnapprovedUsers = () => {
  return useQuery<User[] | null>({
    queryKey: ["useGetUnapprovedUsers"],
    queryFn: async () => {
      return await userService.getUnapprovedUsers();
    },
  });
};
