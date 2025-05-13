// 콜렉션에 저장되는 타입
import { User } from "next-auth";
import { BadgeResponse } from "@/app/(auth)/hub/api";

// 생성 시 전달해야할 requestType
export interface CreateUserBadgeCollectionType {
  userDocId: string; // colletion_user의 docId
  badgeDocIds: string[]; // collection_badge의 docId 배열
}

// 수정 시 전달해야할 requestType
export interface UserBadgeCollectionType extends CreateUserBadgeCollectionType {
  docId: string; // collection_user_badge의 docId
}

// GET 시 받아야하는 데이터의 타입
export interface UserBadgeResponse {
  docId: string; // collection_user_badge의 docId
  user: User; // colletion_user의 docId
  badges: BadgeResponse[]; // collection_badge의 docId 배열
}
