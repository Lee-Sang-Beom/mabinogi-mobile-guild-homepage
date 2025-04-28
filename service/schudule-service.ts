import { collection, doc, deleteDoc, addDoc, getDocs } from 'firebase/firestore';
import { ApiResponse } from '@/shared/types/api';
import { ScheduleRecruitForm } from '@/app/(auth)/schedule/internal';
import { db } from '@/shared/firestore';
import { ScheduleResponse } from '@/app/(auth)/schedule/api';

class ScheduleService {
  private scheduleCollection = collection(db, 'collection_schedule');

  /**
   * @name add
   * @description 파티구인글 추가
   */
  async add(data: ScheduleRecruitForm): Promise<ApiResponse<string | null>> {
    try {
      const docRef = await addDoc(this.scheduleCollection, data);

      return {
        success: true,
        message: "파티 구인글이 정상적으로 등록되었습니다.",
        data: docRef.id,
      };
    } catch (error) {
      console.error('파티 구인글 추가 중 오류가 발생했습니다.', error);
      return {
        success: false,
        message: "파티 구인글 추가 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * @name delete
   * @description 파티구인글 삭제
   */
  async delete(docId: string): Promise<ApiResponse<string | null>> {
    try {
      const docRef = doc(this.scheduleCollection, docId);
      await deleteDoc(docRef);

      return {
        success: true,
        message: "파티 구인글이 정상적으로 삭제되었습니다.",
        data: docId,
      };
    } catch (error) {
      console.error('파티 구인글 삭제 중 오류가 발생했습니다.', error);
      return {
        success: false,
        message: "파티 구인글 삭제 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * @name get
   * @description 파티구인글 목록 조회
   */
  async get(): Promise<ApiResponse<ScheduleResponse[]>> {
    try {
      const querySnapshot = await getDocs(this.scheduleCollection);
      const schedules: ScheduleResponse[] = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<ScheduleResponse, 'docId'>),
        docId: doc.id,
      }));

      return {
        success: true,
        message: "파티 구인글 목록을 불러왔습니다.",
        data: schedules,
      };
    } catch (error) {
      console.error('파티 구인글 조회 중 오류가 발생했습니다.', error);
      return {
        success: false,
        message: "파티 구인글 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }
}

export const scheduleService = new ScheduleService();
