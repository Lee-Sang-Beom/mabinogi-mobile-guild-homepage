import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiResponse } from "@/shared/types/api";
import { badgeService } from "@/service/badge-service";
import { BadgeFormSchemaType } from "@/app/(auth)/hub/schema";

export function useCreateBadge() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, BadgeFormSchemaType>({
    mutationFn: (data) => badgeService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(
          "뱃지 추가 요청을 진행했습니다. 승인 후 도감에 표시됩니다."
        );

        queryClient.invalidateQueries({ queryKey: ["useGetApprovedBadges"] });
        queryClient.invalidateQueries({ queryKey: ["useGetUnApprovedBadges"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`뱃지 생성 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
