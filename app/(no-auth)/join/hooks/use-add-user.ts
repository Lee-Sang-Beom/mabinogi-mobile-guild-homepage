import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { joinFormSchema } from "@/app/(no-auth)/join/schema";
import { ApiResponse } from "@/shared/types/api";
import { toast } from "sonner";
import { userService } from "@/service/user-service";

export const apiAddUser = async (data: z.infer<typeof joinFormSchema>) => {
  return await userService.join(data);
};

export function useAddUserMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<string | null>,
    Error,
    z.infer<typeof joinFormSchema>
  >({
    mutationFn: apiAddUser,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(
          "회원가입이 완료되었습니다. 관리자 승인 후 로그인하실 수 있습니다.",
        );
        queryClient.invalidateQueries({ queryKey: ["useGetUserList"] });
        queryClient.invalidateQueries({ queryKey: ["useGetUnapprovedUsers"] });

        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`회원가입 중 오류가 발생했습니다: ${error.message}`);
    },
  });
}
