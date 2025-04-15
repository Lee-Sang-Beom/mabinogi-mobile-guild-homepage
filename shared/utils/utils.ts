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
