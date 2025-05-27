import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { gameService } from "@/service/game-service";
import { ApiResponse } from "@/shared/types/api";
import { GameCreateRequest } from "@/app/(auth)/game/api";

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<string | null>, Error, GameCreateRequest>({
    mutationFn: (data) => gameService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["games"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`게임 등록 중 오류 발생: ${error.message}`);
    },
  });
}
