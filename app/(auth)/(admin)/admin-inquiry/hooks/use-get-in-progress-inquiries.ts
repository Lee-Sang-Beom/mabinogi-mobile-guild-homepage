import { ApiResponse } from "@/shared/types/api";
import { inquiryService } from "@/service/inquiry-service";
import { useQuery } from "@tanstack/react-query";
import { InquiryResponse } from "@/app/(auth)/inquiry/api";

export function useGetInProgressInquiries() {
  return useQuery<ApiResponse<InquiryResponse[]>, Error>({
    queryKey: ["useGetInProgressInquiries"],
    queryFn: () => inquiryService.getInProgress(),
  });
}
