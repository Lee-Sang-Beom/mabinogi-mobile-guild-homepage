import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiResponse } from "@/shared/types/api";
import { userService } from "@/service/user-service";

/**
 * @name useUpdateApprovalJoinYn
 * @description 주어진 docId의 유저의 approvalJoinYn을 "Y"로 변경하는 훅
 */
export function useUpdateApprovalJoinYn() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, string>({
    mutationFn: (docId) => userService.updateApprovalJoinYn(docId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("승인 상태가 정상적으로 변경되었습니다.");
        queryClient.invalidateQueries({ queryKey: ["useGetUserList"] });
        queryClient.invalidateQueries({ queryKey: ["useGetUnapprovedUsers"] });
      } else {
        toast.error(response.message || "승인 상태 변경에 실패했습니다.");
      }
    },
    onError: (error) => {
      toast.error(`승인 상태 변경 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
