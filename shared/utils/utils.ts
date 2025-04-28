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
