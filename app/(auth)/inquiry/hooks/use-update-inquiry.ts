import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiResponse } from "@/shared/types/api";
import { inquiryService } from "@/service/inquiry-service";
import { UpdateInquiryRequest } from "@/app/(auth)/inquiry/api";

export function useUpdateInquiry() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, UpdateInquiryRequest>({
    mutationFn: ({ docId, data }) => inquiryService.update(docId, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "문의 정보 수정이 완료되었습니다.");
        queryClient.invalidateQueries({ queryKey: ["useGetInquiries"] });
        queryClient.invalidateQueries({
          queryKey: ["useGetInProgressInquiries"],
        });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`문의 정보 수정 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
