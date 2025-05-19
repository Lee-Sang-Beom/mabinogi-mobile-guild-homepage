import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userBadgeService } from "@/service/user-badge-service";
import { ApiResponse } from "@/shared/types/api";
import { CreateUserBadgeCollectionType } from "../api";
import { useRouter } from "next/navigation";

/**
 * ➕ 유저 뱃지 생성 훅
 */
export function useCreateUserBadge() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiResponse<string | null>,
    Error,
    CreateUserBadgeCollectionType
  >({
    mutationFn: (data) => userBadgeService.createUserBadge(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("유저 뱃지가 성공적으로 생성되었습니다.");
        queryClient.invalidateQueries({ queryKey: ["useGetAllUserBadges"] });
        queryClient.invalidateQueries({
          queryKey: ["useGetUserBadgesByUserDocId"],
        });
        queryClient.invalidateQueries({
          queryKey: ["useGetAllUserBadgeCounts"],
        });

        router.push("/admin-badge?tab=give");
        router.refresh();
      } else {
        console.log("response is ", response);
        toast.error(response.message);
      }
    },
    onError: (error) => {
      console.log("error is ", error);
      toast.error(`유저 뱃지 생성 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
