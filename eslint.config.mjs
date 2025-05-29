import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-unused-vars": "off", // 기본 ESLint 규칙 비활성화
      "@typescript-eslint/no-explicit-any": "off", // eslint any 동작허용
      "@typescript-eslint/no-unused-vars": [
        "warn", // 또는 "error"
        {
          argsIgnorePattern: "^_", // 매개변수에서 _로 시작하는 변수 무시
          varsIgnorePattern: "^_", // 일반 변수에서 _로 시작하는 변수 무시
          caughtErrorsIgnorePattern: "^_", // 오류 변수에서 _로 시작하는 변수 무시
        },
      ],
    },
  },
];

export default eslintConfig;
