import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/shared/firestore";
import { ApiResponse } from "@/shared/types/api";
import { GameKindType } from "@/app/(auth)/game/internal";
import {
  GameCreateRequest,
  GameResponse,
  GameUpdateRequest,
} from "@/app/(auth)/game/api";

// 🔖 컬렉션 상수
const GAME_COLLECTION = collection(db, "collection_game");

class GameService {
  // ✅ 특정 게임 종류별 랭킹 조회 (gameType 기준, score 내림차순)
  async getByGameType(
    gameType: GameKindType,
  ): Promise<ApiResponse<GameResponse[]>> {
    try {
      const snapshot = await getDocs(
        query(
          GAME_COLLECTION,
          where("gameType", "==", gameType),
          orderBy("score", "desc"),
        ),
      );

      const games: GameResponse[] = snapshot.docs.map((docSnap, idx) => ({
        ...(docSnap.data() as Omit<GameResponse, "docId" | "rank">),
        docId: docSnap.id,
        rank: idx + 1, // score 순으로 정렬된 index → 랭킹
      }));

      return {
        success: true,
        message: `${gameType} 게임 랭킹을 불러왔습니다.`,
        data: games,
      };
    } catch (error) {
      console.error("게임 랭킹 조회 실패:", error);
      return {
        success: false,
        message: "게임 랭킹 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }

  // ✅ 특정 사용자의 게임 기록 조회 (userId와 gameType 기준)
  async getByUserIdAndGameType(
    userId: string,
    gameType: GameKindType,
  ): Promise<ApiResponse<GameResponse[]>> {
    try {
      const snapshot = await getDocs(
        query(
          GAME_COLLECTION,
          where("userId", "==", userId),
          where("gameType", "==", gameType),
          orderBy("score", "desc"),
        ),
      );

      const games: GameResponse[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Omit<GameResponse, "docId">),
        docId: docSnap.id,
      }));

      return {
        success: true,
        message: "사용자 게임 기록을 불러왔습니다.",
        data: games,
      };
    } catch (error) {
      console.error("사용자 게임 기록 조회 실패:", error);
      return {
        success: false,
        message: "사용자 게임 기록 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }

  // ✅ 게임 생성 (이전 기록 삭제 후 새로 생성)
  async create(game: GameCreateRequest): Promise<ApiResponse<string | null>> {
    try {
      // 1. 해당 사용자의 기존 게임 기록 조회
      const existingGamesResponse = await this.getByUserIdAndGameType(
        game.userId,
        game.gameType,
      );

      if (!existingGamesResponse.success) {
        return {
          success: false,
          message: "기존 게임 기록 조회 중 오류가 발생했습니다.",
          data: null,
        };
      }

      const existingGames = existingGamesResponse.data;

      // 2. 기존 기록이 없는 경우 - 새로 등록
      if (existingGames.length === 0) {
        const docRef = await addDoc(GAME_COLLECTION, game);
        return {
          success: true,
          message: "첫 게임 점수가 성공적으로 등록되었습니다.",
          data: docRef.id,
        };
      }

      // 3. 기존 기록이 있는 경우 - 점수 비교
      const highestExistingScore = Math.max(
        ...existingGames.map((g) => g.score),
      );

      // 3-1. 현재 점수가 기존 최고 점수보다 낮거나 같은 경우
      if (game.score <= highestExistingScore) {
        return {
          success: true,
          message: `기존 최고 점수(${highestExistingScore})보다 낮거나 같은 점수입니다. 기록이 유지됩니다.`,
          data: null,
        };
      }

      // 모든 기존 기록 삭제
      const deletePromises = existingGames.map((existingGame) =>
        deleteDoc(doc(GAME_COLLECTION, existingGame.docId)),
      );

      await Promise.all(deletePromises);

      // 새로운 게임 기록 생성
      const docRef = await addDoc(GAME_COLLECTION, game);

      return {
        success: true,
        message: `신기록 달성! 새로운 최고 점수(${game.score})가 등록되었습니다.`,
        data: docRef.id,
      };
    } catch (error) {
      console.error("게임 점수 등록 실패:", error);
      return {
        success: false,
        message: "게임 점수 등록 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // ✅ 게임 수정
  async update(game: GameUpdateRequest): Promise<ApiResponse<string | null>> {
    try {
      const { docId, ...updateData } = game;
      const docRef = doc(GAME_COLLECTION, docId);
      await updateDoc(docRef, updateData);
      return {
        success: true,
        message: "게임 점수가 성공적으로 수정되었습니다.",
        data: docId,
      };
    } catch (error) {
      console.error("게임 점수 수정 실패:", error);
      return {
        success: false,
        message: "게임 점수 수정 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // ✅ 단일 게임 조회 (docId 기준)
  async getByDocId(docId: string): Promise<ApiResponse<GameResponse | null>> {
    try {
      const docRef = doc(GAME_COLLECTION, docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          message: "게임 기록을 찾을 수 없습니다.",
          data: null,
        };
      }

      return {
        success: true,
        message: "게임 기록을 성공적으로 불러왔습니다.",
        data: {
          ...docSnap.data(),
          docId: docSnap.id,
        } as GameResponse,
      };
    } catch (error) {
      console.error("게임 기록 조회 실패:", error);
      return {
        success: false,
        message: "게임 기록 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // ✅ 게임 기록 삭제
  async delete(docId: string): Promise<ApiResponse<string>> {
    try {
      const docRef = doc(GAME_COLLECTION, docId);
      await deleteDoc(docRef);
      return {
        success: true,
        message: "게임 기록이 성공적으로 삭제되었습니다.",
        data: docId,
      };
    } catch (error) {
      console.error("게임 기록 삭제 실패:", error);
      return {
        success: false,
        message: "게임 기록 삭제 중 오류가 발생했습니다.",
        data: "",
      };
    }
  }
}

// 📦 GameService 인스턴스 생성 (싱글톤)
export const gameService = new GameService();
