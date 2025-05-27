import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { gameService } from "@/service/game-service";
import { ApiResponse } from "@/shared/types/api";
import { GameUpdateRequest } from "@/app/(auth)/game/api";

export function useUpdateGame() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, GameUpdateRequest>({
    mutationFn: (data) => gameService.update(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["games"] });
        queryClient.invalidateQueries({ queryKey: ["game", response.data] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`게임 수정 중 오류 발생: ${error.message}`);
    },
  });
}
