import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { badgeService } from "@/service/badge-service";

export function useUpdateUnApproveBadge() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: (docId) =>
      badgeService.delete(docId).then((res) => {
        if (!res.success) throw new Error(res.message);
        return res.data;
      }),
    onSuccess: (docId) => {
      toast.success("뱃지 승인을 성공적으로 반려했습니다.");
      queryClient.invalidateQueries({ queryKey: ["useGetApprovedBadges"] });
      queryClient.invalidateQueries({ queryKey: ["useGetUnApprovedBadges"] });
      queryClient.invalidateQueries({ queryKey: ["useGetBadgeById", docId] });
    },
    onError: (error) => {
      toast.error(`뱃지 승인 반려 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
