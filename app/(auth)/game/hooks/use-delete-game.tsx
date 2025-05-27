import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { gameService } from "@/service/game-service";
import { ApiResponse } from "@/shared/types/api";

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string>, Error, string>({
    mutationFn: (docId) => gameService.delete(docId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["games"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`게임 삭제 중 오류 발생: ${error.message}`);
    },
  });
}
