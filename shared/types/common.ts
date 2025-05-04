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

/**
 * @name KeyValue
 * @description name, value를 가지는 KeyValue 정의
 */
export interface KeyValue {
  name: string;
  value: string;
}

/**
 * @name Range, ValuePiece, Value
 * @description react-calendar에서 사용하는 값의 타입
 */
type Range<T> = [T, T];
type ValuePiece = Date | null;
export type Value = ValuePiece | Range<ValuePiece>;
