import bcrypt from "bcryptjs";
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
  hashedPassword: string
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
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0')
      const formattedMinute = minute.toString().padStart(2, '0')
      options.push(`${formattedHour}:${formattedMinute}`)
    }
  }
  return options
}

export function compressImages(
  base64Str: string,
  maxWidth = 1280, // 해상도를 높이기 위해 최대 크기 확장
  maxHeight = 1280 // 해상도를 높이기 위해 최대 크기 확장
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
  maxHeight?: number // 선택적 파라미터 추가
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
        maxHeight
      ); // 이미지 압축
      compressedContent = compressedContent.replace(
        originalBase64,
        compressedBase64
      ); // HTML 업데이트
    }
  }

  return compressedContent;
}
