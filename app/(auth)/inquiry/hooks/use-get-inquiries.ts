import { ApiResponse } from "@/shared/types/api";
import { inquiryService } from "@/service/inquiry-service";
import { InquiryResponse } from "../api";
import { useQuery } from "@tanstack/react-query";

export function useGetInquiries() {
  return useQuery<ApiResponse<InquiryResponse[]>, Error>({
    queryKey: ["useGetInquiries"],
    queryFn: () => inquiryService.get(),
  });
}
