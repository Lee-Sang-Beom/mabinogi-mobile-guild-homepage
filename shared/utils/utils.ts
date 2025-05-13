import bcrypt from "bcryptjs";
import { User } from "next-auth";
import { homePageAdminId } from "@/shared/constants/game";

/**
 * @name isHomePageAdmin
 * @description 홈페이지 관리자 계정인지 검사
 * @returns true / false
 */
export function isHomePageAdmin(user: User) {
  return user.id === homePageAdminId;
}

/**
 * @name isRoleAdmin
 * @description 관리자인지 검사
 * @returns true / false
 */
export function isRoleAdmin(user: User) {
  return (
    user.role === "GUILD_MASTER" ||
    user.role === "GUILD_SUB_MASTER" ||
    user.id === homePageAdminId
  );
}

/**
 * @name encryptPassword
 * @description 비밀번호를 bcrypt를 사용하여 암호화합니다.
 * @param password 평문 비밀번호
 * @returns 암호화된 비밀번호
 */
export function encryptPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10); // salt 생성
  return bcrypt.hashSync(password, salt); // 비밀번호 해싱
}

/**
 * @name verifyPassword
 * @description 평문 비밀번호와 암호화된 비밀번호를 비교합니다.
 * @param plainPassword 평문 비밀번호
 * @param hashedPassword 암호화된 비밀번호
 * @returns 비밀번호가 일치하는지 여부 (true/false)
 */
export function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): boolean {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

/**
 * @name clearCache
 * @description 브라우저의 캐시를 삭제하는 함수
 */
export const clearCache = () => {
  if ("caches" in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
};

/**
 * @name generateTimeOptions
 * @description 30분단위 시간을 생성하는 함수
 * @description (00:00, 00:30, 01:00, ...)
 */
export const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      options.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return options;
};

export function compressImages(
  base64Str: string,
  maxWidth = 1280, // 해상도를 높이기 위해 최대 크기 확장
  maxHeight = 1280, // 해상도를 높이기 위해 최대 크기 확장
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let { width, height } = img;

      // 비율을 유지하면서 크기 조정
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        } else {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx!.drawImage(img, 0, 0, width, height);

      // 품질을 100%로 설정하여 해상도를 최대화
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8); // 품질 100%
      resolve(compressedBase64);
    };
  });
}

export async function compressContentImages(
  content: string,
  maxWidth?: number, // 선택적 파라미터 추가
  maxHeight?: number, // 선택적 파라미터 추가
): Promise<string> {
  const imageRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/g; // img 태그에서 src 추출
  let match;
  let compressedContent = content;

  while ((match = imageRegex.exec(content)) !== null) {
    const originalBase64 = match[1]; // img src에서 Base64 추출
    if (originalBase64.startsWith("data:image/")) {
      const compressedBase64 = await compressImages(
        originalBase64,
        maxWidth,
        maxHeight,
      ); // 이미지 압축
      compressedContent = compressedContent.replace(
        originalBase64,
        compressedBase64,
      ); // HTML 업데이트
    }
  }

  return compressedContent;
}

/**
 * HEX 색상 코드를 RGBA로 변환하는 함수
 */
export function hexToRgba(hex: string, alpha = 1): string {
  // # 기호 제거
  hex = hex.replace("#", "");

  // HEX 값을 RGB로 변환
  const r = Number.parseInt(hex.substring(0, 2), 16);
  const g = Number.parseInt(hex.substring(2, 4), 16);
  const b = Number.parseInt(hex.substring(4, 6), 16);

  // RGBA 문자열 반환
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 객체가 주어진 키에 접근 가능한지 확인하는 타입 가드
 */
const hasKey = <T>(obj: T, key: string): obj is T & Record<string, unknown> => {
  return (
    obj !== null && obj !== undefined && typeof obj === "object" && key in obj
  );
};

/**
 * 객체에서 중첩된 프로퍼티 값을 가져오는 함수
 * @param obj 대상 객체
 * @param path 프로퍼티 경로 (예: 'badge.name')
 * @returns 프로퍼티 값 또는 undefined
 */
export const getNestedValue = <T, R = unknown>(
  obj: T,
  path: string,
): R | undefined => {
  if (!obj) return undefined;

  try {
    // 초기 값으로 obj를 unknown 타입으로 설정
    let result: unknown = obj;

    // 경로를 나누어 순차적으로 접근
    const parts = path.split(".");

    for (const part of parts) {
      // 현재 결과가 객체이고 해당 키가 있는지 확인
      if (!hasKey(result, part)) {
        return undefined;
      }

      // 다음 중첩 값으로 이동
      result = result[part];

      // null 또는 undefined인 경우 즉시 반환
      if (result === null || result === undefined) {
        return undefined;
      }
    }

    // 최종 결과를 요청된 타입으로 반환
    return result as R;
  } catch {
    return undefined;
  }
};

/**
 * 단일 데이터 항목을 검색어와 대조하는 필터 함수
 * @param item 검색할 대상 항목
 * @param searchTerm 검색어
 * @param props 검색할 프로퍼티 경로 배열 (단일 문자열 또는 배열)
 * @returns 검색어가 포함되었는지 여부
 */
export const filterBySearchTerm = <T>(
  item: T,
  searchTerm: string,
  props: string | string[],
): boolean => {
  if (!searchTerm || !item) return true;

  const term = searchTerm.toLowerCase().trim();
  if (!term) return true;

  // 단일 프로퍼티일 경우 배열로 변환
  const properties = Array.isArray(props) ? props : [props];

  return properties.some((prop) => {
    // 중첩 프로퍼티 값 가져오기
    const value = getNestedValue(item, prop);

    // 값이 존재하면 검색어 포함 여부 확인
    return value !== undefined && value !== null
      ? String(value).toLowerCase().includes(term)
      : false;
  });
};

/**
 * 데이터 배열을 검색하는 간단한 유틸 함수
 * @param data 검색할 데이터 배열
 * @param searchTerm 검색어
 * @param props 검색할 프로퍼티 경로 (단일 문자열 또는 배열)
 * @returns 필터링된 데이터 배열
 */
export const getSearchTermData = <T>(
  data: T[] | undefined | null,
  searchTerm: string,
  props: string | string[],
): T[] => {
  // 데이터가 없으면 빈 배열 반환
  if (!data || !Array.isArray(data)) return [];

  // 검색어가 없으면 원본 데이터 반환
  if (!searchTerm || searchTerm.trim() === "") return [...data];

  // 프로퍼티가 없으면 원본 데이터 반환
  if (!props || (Array.isArray(props) && props.length === 0)) return [...data];

  // 필터링
  return data.filter((item) => filterBySearchTerm(item, searchTerm, props));
};
