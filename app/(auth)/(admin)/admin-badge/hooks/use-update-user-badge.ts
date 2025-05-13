import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userBadgeService } from "@/service/user-badge-service";
import { ApiResponse } from "@/shared/types/api";
import { UserBadgeCollectionType } from "../api";

/**
 * 🔄 유저 뱃지 수정 훅
 */
export function useUpdateUserBadge() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<string | null>,
    Error,
    { docId: string; data: UserBadgeCollectionType; appendBadgeDocId: string }
  >({
    mutationFn: ({ docId, data, appendBadgeDocId }) =>
      userBadgeService.updateUserBadge(docId, data, appendBadgeDocId),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success("유저 뱃지 정보가 성공적으로 수정되었습니다.");
        queryClient.invalidateQueries({ queryKey: ["useGetAllUserBadges"] });
        queryClient.invalidateQueries({
          queryKey: ["useGetUserBadgesByUserDocId", variables.data.userDocId],
        });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`유저 뱃지 수정 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
