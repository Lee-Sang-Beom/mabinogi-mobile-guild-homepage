import { signIn } from "next-auth/react";
import * as z from 'zod'
import { loginFormSchema } from '@/app/(no-auth)/login/schema'

export async function login(values: z.infer<typeof loginFormSchema>) {
  return await signIn("credentials", {
    ...values,
    redirect: false,
  });
}
