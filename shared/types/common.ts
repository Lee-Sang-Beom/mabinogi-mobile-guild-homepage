/**
 * @name YnFlag
 * @description "Y" 혹은 "N"을 값으로 가지는 타입 정의
 */
export type YnFlag = "Y" | "N";

/**
 * @name EnumType<T>
 * @description type, name을 가지는 enumType 정의
 */
export interface EnumType<T> {
  type: T;
  name: string;
}

export interface KeyValue {
  name: string;
  value: string;
}
