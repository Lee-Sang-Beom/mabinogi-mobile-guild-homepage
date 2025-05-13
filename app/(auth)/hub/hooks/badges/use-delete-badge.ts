import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { badgeService } from "@/service/badge-service";

export function useDeleteBadge() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: (docId) =>
      badgeService.delete(docId).then((res) => {
        if (!res.success) throw new Error(res.message);
        return res.data;
      }),
    onSuccess: (docId) => {
      toast.success("뱃지가 성공적으로 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["useGetApprovedBadges"] });
      queryClient.invalidateQueries({ queryKey: ["useGetUnApprovedBadges"] });
      queryClient.invalidateQueries({ queryKey: ["useGetBadgeById", docId] });
      queryClient.invalidateQueries({
        queryKey: ["useGetUserBadgesByUserDocId"],
      });
    },
    onError: (error) => {
      toast.error(`뱃지 삭제 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
