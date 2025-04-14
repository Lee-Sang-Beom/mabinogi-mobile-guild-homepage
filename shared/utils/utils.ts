import bcrypt from "bcryptjs";

/**
 * 암호화된 비밀번호와 평문 비밀번호 비교
 */
export function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): boolean {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}
