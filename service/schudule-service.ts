import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '@/shared/firestore'

import { ApiResponse } from '@/shared/types/api';
import { ScheduleRecruitForm } from '@/app/(auth)/schedule/internal';
import { ScheduleResponse } from '@/app/(auth)/schedule/api';
import moment from 'moment'

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
        message: "파티원 모집 정보가 정상적으로 등록되었습니다.",
        data: docRef.id,
      };
    } catch (error) {
      console.error('파티원 모집 정보 추가 중 오류가 발생했습니다.', error);
      return {
        success: false,
        message: "파티원 모집 정보 추가 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * @name update
   * @description 파티구인글 수정
   */
  async update(docId: string, data: Partial<ScheduleRecruitForm>): Promise<ApiResponse<string | null>> {
    try {
      const docRef = doc(db, 'collection_schedule', docId);
      await updateDoc(docRef, data);

      return {
        success: true,
        message: "파티원 모집 정보가 정상적으로 수정되었습니다.",
        data: docId,
      };
    } catch (error) {
      console.error('파티원 모집 정보 수정 중 오류가 발생했습니다.', error);
      return {
        success: false,
        message: "파티원 모집 정보 수정 중 오류가 발생했습니다.",
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
      // const docRef = doc(this.scheduleCollection, docId);
      const docRef = doc(db, 'collection_schedule', docId); // 이 라인만 수정
      await deleteDoc(docRef);

      return {
        success: true,
        message: "파티원 모집 정보가 정상적으로 삭제되었습니다.",
        data: docId,
      };
    } catch (error) {
      console.error('파티원 모집 정보 삭제 중 오류가 발생했습니다.', error);
      return {
        success: false,
        message: "파티원 모집 정보 삭제 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * @name get
   * @description 선택된 날짜의 파티구인글 목록 조회
   * @param selectedDate 선택된 날짜 string (YYYY-MM-DD)
   */
  async get(selectedDate: Date): Promise<ApiResponse<ScheduleResponse[]>> {
    try {
      // selectedDate를 moment로 변환하여 'YYYY-MM-DD' 형식으로 맞춤
      const formattedDate: string = moment(selectedDate).format('YYYY-MM-DD');

      // 쿼리로 날짜 필터링 (문자열로 비교)
      const q = query(
        this.scheduleCollection,
        where('date', '==', formattedDate)
      );

      const querySnapshot = await getDocs(q);
      const schedules: ScheduleResponse[] = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<ScheduleResponse, 'docId'>),
        docId: doc.id,
      })).sort((a, b) => b.time.localeCompare(a.time));

      return {
        success: true,
        message: "선택된 날짜의 파티원 모집 정보 목록을 불러왔습니다.",
        data: schedules,
      };
    } catch (error) {
      console.error('파티원 모집 정보 조회 중 오류가 발생했습니다.', error);
      return {
        success: false,
        message: "파티원 모집 정보 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }
}

export const scheduleService = new ScheduleService();
