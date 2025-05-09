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
        toast.success("뱃지가 성공적으로 생성되었습니다.");
        queryClient.invalidateQueries({ queryKey: ["useGetBadges"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`뱃지 생성 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
