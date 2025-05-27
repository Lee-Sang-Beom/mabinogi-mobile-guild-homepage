import { useQuery } from "@tanstack/react-query";
import { gameService } from "@/service/game-service";
import { GameKindType } from "@/app/(auth)/game/internal";
import { ApiResponse } from "@/shared/types/api";
import { GameResponse } from "@/app/(auth)/game/api";

export function useGetGamesByGameType(gameType: GameKindType) {
  return useQuery<ApiResponse<GameResponse[]>, Error>({
    queryKey: ["games", gameType],
    queryFn: () => gameService.getByGameType(gameType),
  });
}
