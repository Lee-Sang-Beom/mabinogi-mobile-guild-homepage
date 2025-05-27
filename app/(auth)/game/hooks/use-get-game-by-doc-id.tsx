import { useQuery } from "@tanstack/react-query";
import { gameService } from "@/service/game-service";
import { ApiResponse } from "@/shared/types/api";
import { GameResponse } from "@/app/(auth)/game/api";

export function useGetGameByDocId(docId: string) {
  return useQuery<ApiResponse<GameResponse | null>, Error>({
    queryKey: ["game", docId],
    queryFn: () => gameService.getByDocId(docId),
    enabled: !!docId, // docId 있을 때만 실행
  });
}
