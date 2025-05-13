import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiResponse } from "@/shared/types/api";
import { badgeService } from "@/service/badge-service";
import { useRouter } from "next/navigation";
import { BadgeFormSchemaType } from "@/app/(auth)/hub/schema";

interface UpdateBadgeRequest {
  docId: string;
  data: BadgeFormSchemaType;
}

export function useUpdateBadge() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<ApiResponse<string | null>, Error, UpdateBadgeRequest>({
    mutationFn: ({ docId, data }) => badgeService.update(docId, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(
          "뱃지 수정 요청을 진행했습니다. 승인 후 도감에 표시됩니다.",
        );
        queryClient.invalidateQueries({ queryKey: ["useGetApprovedBadges"] });
        queryClient.invalidateQueries({ queryKey: ["useGetUnApprovedBadges"] });
        queryClient.invalidateQueries({
          queryKey: ["useGetBadgeById", variables.docId],
        });
        queryClient.invalidateQueries({
          queryKey: ["useGetUserBadgesByUserDocId"],
        });
        router.refresh();
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`뱃지 수정 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
