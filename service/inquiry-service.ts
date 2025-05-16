import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/shared/firestore";
import { ApiResponse } from "@/shared/types/api";
import { InquiryFormSchema } from "@/app/(auth)/inquiry/schema";
import { InquiryResponse } from "@/app/(auth)/inquiry/api";

class InquiryService {
  private inquiryCollection = collection(db, "collection_inquiry");

  // 조회
  async get(): Promise<ApiResponse<InquiryResponse[]>> {
    try {
      const snapshot = await getDocs(this.inquiryCollection);
      const inquiries: InquiryResponse[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          docId: docSnap.id,
        } as InquiryResponse;
      });

      // 날짜 문자열을 기준으로 내림차순 정렬 (최신순)
      inquiries.sort((a, b) => {
        const dateA = new Date(a.mngDt || 0);
        const dateB = new Date(b.mngDt || 0);
        return dateB.getTime() - dateA.getTime(); // 최신순
      });

      return {
        success: true,
        message: "문의 목록을 불러왔습니다.",
        data: inquiries,
      };
    } catch (error) {
      console.error("문의 목록 조회 실패:", error);
      return {
        success: false,
        message: "문의 목록 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }

  // 진행 중인 문의 조회
  async getInProgress(): Promise<ApiResponse<InquiryResponse[]>> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.inquiryCollection,
          where("step", "==", "INQUIRY_STEP_IN_PROGRESS"),
        ),
      );

      const inquiries: InquiryResponse[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          docId: docSnap.id,
        } as InquiryResponse;
      });

      // 날짜 문자열을 기준으로 내림차순 정렬 (최신순)
      inquiries.sort((a, b) => {
        const dateA = new Date(a.mngDt || 0);
        const dateB = new Date(b.mngDt || 0);
        return dateB.getTime() - dateA.getTime(); // 최신순
      });

      return {
        success: true,
        message: "진행 중인 문의 목록을 불러왔습니다.",
        data: inquiries,
      };
    } catch (error) {
      console.error("진행 중인 문의 목록 조회 실패:", error);
      return {
        success: false,
        message: "진행 중인 문의 목록 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }

  // 특정 문의 조회 (docId 기준)
  async getByDocId(
    docId: string,
  ): Promise<ApiResponse<InquiryResponse | null>> {
    try {
      const docRef = doc(db, "collection_inquiry", docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          message: "해당 문의를 찾을 수 없습니다.",
          data: null,
        };
      }

      const data = docSnap.data();
      const inquiry: InquiryResponse = {
        ...data,
        docId: docSnap.id,
      } as InquiryResponse;

      return {
        success: true,
        message: "문의 내용을 성공적으로 불러왔습니다.",
        data: inquiry,
      };
    } catch (error) {
      console.error("문의 조회 실패:", error);
      return {
        success: false,
        message: "문의 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // 생성
  async create(data: InquiryFormSchema): Promise<ApiResponse<string | null>> {
    try {
      const docRef = await addDoc(this.inquiryCollection, data);
      return {
        success: true,
        message: "문의 정보가 성공적으로 생성되었습니다.",
        data: docRef.id,
      };
    } catch (error) {
      console.error("문의 생성 실패:", error);
      return {
        success: false,
        message: "문의 정보 생성 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // 업데이트
  async update(
    docId: string,
    data: InquiryFormSchema,
  ): Promise<ApiResponse<string | null>> {
    try {
      const docRef = doc(db, "collection_inquiry", docId);
      await updateDoc(docRef, data);
      return {
        success: true,
        message:
          data.step === "INQUIRY_STEP_IN_PROGRESS"
            ? "문의 정보가 성공적으로 수정되었습니다."
            : "문의 답변이 완료되었습니다.",
        data: docId,
      };
    } catch (error) {
      console.error("문의 수정 실패:", error);
      return {
        success: false,
        message: "문의 수정 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // 삭제
  async delete(docIds: string | string[]): Promise<ApiResponse<string[]>> {
    const ids = Array.isArray(docIds) ? docIds : [docIds];

    try {
      await Promise.all(
        ids.map((id) => {
          const docRef = doc(db, "collection_inquiry", id);
          return deleteDoc(docRef);
        }),
      );

      return {
        success: true,
        message: `${ids.length}개의 문의가 성공적으로 삭제되었습니다.`,
        data: ids,
      };
    } catch (error) {
      console.error("문의 삭제 실패:", error);
      return {
        success: false,
        message: "문의 삭제 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }
}

export const inquiryService = new InquiryService();
