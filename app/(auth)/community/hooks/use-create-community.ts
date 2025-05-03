// use-create-community.ts (또는 해당 파일)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiResponse } from "@/shared/types/api";
import { communityService } from "@/service/community-service";
import { NoticeFormSchema } from "@/shared/notice/schema";
import { CommunityNoticeType } from "@/shared/notice/internal";

interface CreateNoticeRequest {
  type: CommunityNoticeType;
  data: NoticeFormSchema;
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, CreateNoticeRequest>({
    mutationFn: ({ type, data }) => communityService.create(type, data), // type을 여기에 넘김
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success("커뮤니티 정보가 성공적으로 등록되었습니다.");
        queryClient.invalidateQueries({
          queryKey: ["useGetCommunity", variables.type],
        });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(
        `커뮤니티 정보 등록 중 오류가 발생했습니다: ${error.message}`
      );
    },
  });
}
