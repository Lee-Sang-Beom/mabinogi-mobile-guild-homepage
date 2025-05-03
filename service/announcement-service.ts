import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '@/shared/firestore'
import { ApiResponse } from '@/shared/types/api'
import { NoticeResponse } from '@/shared/notice/api';
import { NoticeFormSchema } from '@/shared/notice/schema';


class AnnouncementService {
  private announcementCollection = collection(db, 'collection_announcement');

  /**
   * 전체 공지사항 목록 조회
   */
  async get(): Promise<ApiResponse<NoticeResponse[]>> {
    try {
      const snapshot = await getDocs(this.announcementCollection);
      const announcements: NoticeResponse[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
         ...data,
          docId: docSnap.id,
        } as NoticeResponse;
      });

      return {
        success: true,
        message: '공지사항 목록을 불러왔습니다.',
        data: announcements,
      };
    } catch (error) {
      console.error('공지사항 목록 조회 실패:', error);
      return {
        success: false,
        message: '공지사항 목록 조회 중 오류가 발생했습니다.',
        data: [],
      };
    }
  }


  /**
   * 특정 공지사항 조회 (docId 기준)
   */
  async getByDocId(docId: string): Promise<ApiResponse<NoticeResponse | null>> {
    try {
      const docRef = doc(db, 'collection_announcement', docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          message: '해당 공지사항을 찾을 수 없습니다.',
          data: null,
        };
      }

      const data = docSnap.data();
      const announcement: NoticeResponse = {
        ...data,
        docId: docSnap.id,
      } as NoticeResponse;

      return {
        success: true,
        message: '공지사항을 성공적으로 불러왔습니다.',
        data: announcement,
      };
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
      return {
        success: false,
        message: '공지사항 조회 중 오류가 발생했습니다.',
        data: null,
      };
    }
  }

  /**
   * 공지사항 생성
   */
  async create(data: NoticeFormSchema): Promise<ApiResponse<string | null>> {
    try {
      const docRef = await addDoc(this.announcementCollection, data);
      return {
        success: true,
        message: '공지사항이 성공적으로 생성되었습니다.',
        data: docRef.id,
      };
    } catch (error) {
      console.error('공지사항 생성 실패:', error);
      return {
        success: false,
        message: '공지사항 생성 중 오류가 발생했습니다.',
        data: null,
      };
    }
  }

  /**
   * 공지사항 수정 (docId 기준 덮어쓰기)
   */
  async update(docId: string, data: NoticeFormSchema): Promise<ApiResponse<string | null>> {
    try {
      const docRef = doc(db, 'collection_announcement', docId);
      await updateDoc(docRef, data);
      return {
        success: true,
        message: '공지사항이 성공적으로 수정되었습니다.',
        data: docId,
      };
    } catch (error) {
      console.error('공지사항 수정 실패:', error);
      return {
        success: false,
        message: '공지사항 수정 중 오류가 발생했습니다.',
        data: null,
      };
    }
  }

  /**
   * 공지사항 삭제 (단일 또는 다중 docId)
   */
  async delete(docIds: string | string[]): Promise<ApiResponse<string[]>> {
    const ids = Array.isArray(docIds) ? docIds : [docIds];

    try {
      await Promise.all(
        ids.map((id) => {
          const docRef = doc(db, 'collection_announcement', id);
          return deleteDoc(docRef);
        })
      );

      return {
        success: true,
        message: `${ids.length}개의 공지사항이 성공적으로 삭제되었습니다.`,
        data: ids,
      };
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      return {
        success: false,
        message: '공지사항 삭제 중 오류가 발생했습니다.',
        data: [],
      };
    }
  }

}

export const announcementService = new AnnouncementService();
