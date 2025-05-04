// use-update-community.ts (또는 해당 파일)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiResponse } from "@/shared/types/api";
import { communityService } from "@/service/community-service";
import { NoticeFormSchema } from "@/shared/notice/schema";
import { CommunityNoticeType } from "@/shared/notice/internal";

interface UpdateNoticeRequest {
  type: CommunityNoticeType;
  docId: string;
  data: NoticeFormSchema;
}

export function useUpdateCommunity() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, UpdateNoticeRequest>({
    mutationFn: ({ type, docId, data }) =>
      communityService.update(type, docId, data), // type을 여기에 넘김
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success("커뮤니티 정보가 성공적으로 수정되었습니다.");
        queryClient.invalidateQueries({
          queryKey: ["useGetCommunity", variables.type],
        });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(
        `커뮤니티 정보 수정 중 오류가 발생했습니다: ${error.message}`
      );
    },
  });
}
