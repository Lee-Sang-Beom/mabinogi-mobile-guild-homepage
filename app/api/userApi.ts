import { db } from "@/shared/firestore";
import { ApiResponse } from "@/shared/types/api";
import { collection, getDocs, query, where } from "firebase/firestore";
import { User } from "next-auth";
import { z } from "zod";
import { joinFormSchema } from "../(no-auth)/join/schema";
import { addCollectionUser } from "@/service/user/user-service";

/**
 * @name getCollectionUserByIdAndPassword
 * @description 사용자 정보를 ID/PW로 조회
 */
export async function getCollectionUserByIdAndPassword(
  id: string,
  password: string
): Promise<User | null> {
  const response = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ id, password }),
  });

  if (!response.ok) return null;
  const result: ApiResponse<User> = await response.json();
  return result.data || null;
}

/**
 * @name getUserById
 * @description Firestore에서 특정 ID를 가진 유저를 조회
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const q = query(collection(db, "collection_user"), where("id", "==", id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    return querySnapshot.docs[0].data() as User;
  } catch (e) {
    console.error("Error fetching user by ID: ", e);
    throw new Error("Failed to fetch user by ID");
  }
}

/**
 * @name apiAddUser
 * @description 프론트에서 호출할 API
 */
export const apiAddUser = async (data: z.infer<typeof joinFormSchema>) => {
  const response = await addCollectionUser(data);
  return response;
};
