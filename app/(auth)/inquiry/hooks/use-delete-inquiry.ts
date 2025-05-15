import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiResponse } from "@/shared/types/api";
import { inquiryService } from "@/service/inquiry-service";

export function useDeleteInquiry() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string[]>, Error, string | string[]>({
    mutationFn: (docIds) => inquiryService.delete(docIds),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["useGetInquiries"] });
    },
    onError: (error) => {
      console.error("문의 삭제 실패:", error);
      toast.error("문의 삭제 중 오류가 발생했습니다.");
    },
  });
}
