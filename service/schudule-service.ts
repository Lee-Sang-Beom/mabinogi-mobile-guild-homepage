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
import {
  ParticipateForm,
  ScheduleRecruitForm,
} from "@/app/(auth)/schedule/internal";
import { ScheduleResponse } from "@/app/(auth)/schedule/api";
import moment from "moment";

class ScheduleService {
  private scheduleCollection = collection(db, "collection_schedule");

  /**
   * @name get
   * @description 선택된 날짜의 파티구인글 목록 조회
   * @param selectedDate 선택된 날짜 string (YYYY-MM-DD)
   */
  async get(selectedDate: Date): Promise<ApiResponse<ScheduleResponse[]>> {
    try {
      // selectedDate를 moment로 변환하여 'YYYY-MM-DD' 형식으로 맞춤
      const formattedDate: string = moment(selectedDate).format("YYYY-MM-DD");

      // 쿼리로 날짜 필터링 (문자열로 비교)
      const q = query(
        this.scheduleCollection,
        where("date", "==", formattedDate)
      );

      const querySnapshot = await getDocs(q);
      const schedules: ScheduleResponse[] = querySnapshot.docs
        .map((doc) => ({
          ...(doc.data() as Omit<ScheduleResponse, "docId">),
          docId: doc.id,
        }))
        .sort((a, b) => b.time.localeCompare(a.time));

      return {
        success: true,
        message: "선택된 날짜의 파티원 모집 정보 목록을 불러왔습니다.",
        data: schedules,
      };
    } catch (error) {
      console.error("파티원 모집 정보 조회 중 오류가 발생했습니다.", error);
      return {
        success: false,
        message: "파티원 모집 정보 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }

  /**
   * @name getAll
   * @description 전체 날짜의 파티구인글 목록 조회
   */
  async getAll(): Promise<ApiResponse<ScheduleResponse[]>> {
    try {
      const q = query(this.scheduleCollection);

      const querySnapshot = await getDocs(q);
      const schedules: ScheduleResponse[] = querySnapshot.docs
        .map((doc) => ({
          ...(doc.data() as Omit<ScheduleResponse, "docId">),
          docId: doc.id,
        }))
        .sort((a, b) => b.time.localeCompare(a.time));

      return {
        success: true,
        message: "파티원 모집 정보 목록을 불러왔습니다.",
        data: schedules,
      };
    } catch (error) {
      console.error("파티원 모집 정보 조회 중 오류가 발생했습니다.", error);
      return {
        success: false,
        message: "파티원 모집 정보 조회 중 오류가 발생했습니다.",
        data: [],
      };
    }
  }

  /**
   * @name getLatest
   * @description mngDt 기준으로 가장 최근의 하나의 파티구인글을 조회
   */
  async getLatest(): Promise<ApiResponse<ScheduleResponse | null>> {
    try {
      const q = query(this.scheduleCollection); // 전체 가져오기

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: true,
          message: "최신 파티구인글이 존재하지 않습니다.",
          data: null,
        };
      }

      // 최신이면서 현재 시간 이후인 문서 찾기
      let latestDoc: ScheduleResponse | null = null;
      let latestMoment: moment.Moment | null = null;
      const now = moment();

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<ScheduleResponse, "docId">;
        const combined = moment(
          `${data.date} ${data.time}`,
          "YYYY-MM-DD HH:mm"
        );

        // 현재 시간 이후인 경우만 고려
        if (combined.isAfter(now)) {
          if (!latestMoment || combined.isBefore(latestMoment)) {
            latestMoment = combined;
            latestDoc = { ...data, docId: doc.id };
          }
        }
      });

      if (!latestDoc) {
        return {
          success: true,
          message: "현재 시간 이후의 파티구인글이 존재하지 않습니다.",
          data: null,
        };
      }

      return {
        success: true,
        message: "가장 최근의 파티원 모집 정보를 불러왔습니다.",
        data: latestDoc,
      };
    } catch (error) {
      console.error("최신 파티원 모집 정보 조회 중 오류 발생: ", error);
      return {
        success: false,
        message: "최신 파티원 모집 정보 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

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
      console.error("파티원 모집 정보 추가 중 오류가 발생했습니다.", error);
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
  async update(
    docId: string,
    data: Partial<ScheduleRecruitForm>
  ): Promise<ApiResponse<string | null>> {
    try {
      const docRef = doc(db, "collection_schedule", docId);
      await updateDoc(docRef, data);

      return {
        success: true,
        message: "파티원 모집 정보가 정상적으로 수정되었습니다.",
        data: docId,
      };
    } catch (error) {
      console.error("파티원 모집 정보 수정 중 오류가 발생했습니다.", error);
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
      const docRef = doc(db, "collection_schedule", docId); // 이 라인만 수정
      await deleteDoc(docRef);

      return {
        success: true,
        message: "파티원 모집 정보가 정상적으로 삭제되었습니다.",
        data: docId,
      };
    } catch (error) {
      console.error("파티원 모집 정보 삭제 중 오류가 발생했습니다.", error);
      return {
        success: false,
        message: "파티원 모집 정보 삭제 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  /**
   * @name updateParticipateStatus
   * @description 파티구인글에서 파티참가/파티 취소 관리
   */
  async updateParticipateStatus(
    scheduleDocId: string,
    participateUser: ParticipateForm,
    isParticipate: boolean
  ): Promise<ApiResponse<null>> {
    try {
      const scheduleRef = doc(this.scheduleCollection, scheduleDocId);
      const scheduleSnap = await getDoc(scheduleRef);

      if (!scheduleSnap.exists()) {
        return {
          success: false,
          message: "해당 파티가 존재하지 않습니다.",
          data: null,
        };
      }

      const currentData = scheduleSnap.data() as ScheduleResponse;
      let updatedParticipateEtcUser = currentData.participateEtcUser ?? [];

      if (isParticipate) {
        // 이미 참여 중이면 제거
        updatedParticipateEtcUser = updatedParticipateEtcUser.filter(
          (u) =>
            u.participateUserParentDocId !==
            participateUser.participateUserParentDocId
        );
      } else {
        // 참여 안했으면 추가
        updatedParticipateEtcUser.push(participateUser);
      }

      await updateDoc(scheduleRef, {
        participateEtcUser: updatedParticipateEtcUser,
        updatedAt: moment().toISOString(),
      });

      return {
        success: true,
        message: isParticipate
          ? "파티에서 탈퇴했습니다."
          : "파티에 가입했습니다.",
        data: null,
      };
    } catch (error) {
      console.error("파티 참여 상태 변경 실패: ", error);
      return {
        success: false,
        message: "파티 참여 상태 변경에 실패했습니다.",
        data: null,
      };
    }
  }
}

export const scheduleService = new ScheduleService();
