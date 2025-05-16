import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiResponse } from "@/shared/types/api";
import { inquiryService } from "@/service/inquiry-service";
import { InquiryFormSchema } from "@/app/(auth)/inquiry/schema";

// 문의 생성
export function useCreateInquiry() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, InquiryFormSchema>({
    mutationFn: (data) => inquiryService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("문의가 성공적으로 등록되었습니다.");
        queryClient.invalidateQueries({ queryKey: ["useGetInquiries"] });
        queryClient.invalidateQueries({
          queryKey: ["useGetInProgressInquiries"],
        });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`문의 등록 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
