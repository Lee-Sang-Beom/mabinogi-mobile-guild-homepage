import * as z from "zod";
export const loginFormSchema = z.object({
    id: z.string().min(2, {
        message: "아이디(캐릭터 이름)는 최소 2자 이상이어야 합니다.",
    }),
    password: z.string().min(6, {
        message: "비밀번호는 최소 6자 이상이어야 합니다.",
    }),
})