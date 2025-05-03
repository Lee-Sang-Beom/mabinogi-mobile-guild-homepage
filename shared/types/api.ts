// 모든 API 응답에서 공통으로 사용되는 제네릭 Response
export interface ApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
}

