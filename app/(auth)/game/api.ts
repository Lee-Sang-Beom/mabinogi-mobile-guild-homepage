import { GameKindType } from "@/app/(auth)/game/internal";

export interface GameResponse {
  docId: string; // "collection_game" 콜렉션 doc의 id
  gameType: GameKindType; // 게임 종류
  score: number; // 점수
  rank: number; // 랭킹
  userDocId: string; // 유저 docId
  userId: string; // 유저 캐릭터 id
  regDt: string; // moment(등록일 Date 데이터).format("YYYY-MM-DD")
}
export interface GameCreateRequest {
  gameType: GameKindType; // 게임 종류
  score: number; // 점수
  rank: number; // 랭킹
  userDocId: string; // 유저 docId
  userId: string; // 유저 캐릭터 id
  regDt: string; // moment(등록일 Date 데이터).format("YYYY-MM-DD")
}
export interface GameUpdateRequest {
  docId: string; // "collection_game" 콜렉션 doc의 id
  gameType: GameKindType; // 게임 종류
  score: number; // 점수
  rank: number; // 랭킹
  userDocId: string; // 유저 docId
  userId: string; // 유저 캐릭터 id
  regDt: string; // moment(등록일 Date 데이터).format("YYYY-MM-DD")
}
