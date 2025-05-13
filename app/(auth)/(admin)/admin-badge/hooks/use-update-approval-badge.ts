import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { badgeService } from "@/service/badge-service";
import { ApiResponse } from "@/shared/types/api";

interface ApproveBadgeRequest {
  docId: string;
}

export function useUpdateApproveBadge() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, ApproveBadgeRequest>({
    mutationFn: ({ docId }) => badgeService.approve(docId),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success("뱃지 요청을 성공적으로 승인했습니다.");
        // 승인 및 미승인 목록 갱신
        queryClient.invalidateQueries({ queryKey: ["useGetApprovedBadges"] });
        queryClient.invalidateQueries({ queryKey: ["useGetUnApprovedBadges"] });
        // 단일 뱃지 갱신
        queryClient.invalidateQueries({
          queryKey: ["useGetBadgeById", variables.docId],
        });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`뱃지 승인 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
