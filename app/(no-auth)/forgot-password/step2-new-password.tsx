"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Check, X } from "lucide-react"

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
      .regex(/[A-Z]/, { message: "비밀번호는 최소 하나의 대문자를 포함해야 합니다." })
      .regex(/[a-z]/, { message: "비밀번호는 최소 하나의 소문자를 포함해야 합니다." })
      .regex(/[0-9]/, { message: "비밀번호는 최소 하나의 숫자를 포함해야 합니다." })
      .regex(/[^A-Za-z0-9]/, { message: "비밀번호는 최소 하나의 특수문자를 포함해야 합니다." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

type Step2Props = {
  onSuccess: () => void
  onFailure: () => void
}

export default function Step2NewPassword({ onSuccess, onFailure }: Step2Props) {
  console.log('onFailure ', onFailure)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)

    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial,
    }
  }

  const password = form.watch("password")
  const passwordValidation = validatePassword(password)
  const confirmPassword = form.watch("confirmPassword")
  const passwordsMatch = password === confirmPassword && confirmPassword !== ""

  function onSubmit(values: z.infer<typeof passwordSchema>) {
    console.log('valus is ', values)
    setIsSubmitting(true)

    // 여기서는 데모를 위해 간단한 로직을 사용합니다.
    // 실제로는 서버에 요청을 보내 비밀번호를 변경해야 합니다.
    setTimeout(() => {
      // 데모 목적으로 항상 성공으로 처리합니다.
      // 실제 구현에서는 이 부분을 서버 요청으로 대체해야 합니다.
      onSuccess()
      setIsSubmitting(false)
    }, 1500)
  }

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center space-x-2">
      {isValid ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
      <span className={`text-xs ${isValid ? "text-green-500" : "text-red-500"}`}>{text}</span>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">새 비밀번호</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="새 비밀번호"
                      {...field}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <FormMessage />

                {password && (
                  <div className="mt-2 space-y-1">
                    <ValidationItem isValid={passwordValidation.minLength} text="8자 이상" />
                    <ValidationItem isValid={passwordValidation.hasUppercase} text="대문자 포함" />
                    <ValidationItem isValid={passwordValidation.hasLowercase} text="소문자 포함" />
                    <ValidationItem isValid={passwordValidation.hasNumber} text="숫자 포함" />
                    <ValidationItem isValid={passwordValidation.hasSpecial} text="특수문자 포함" />
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">새 비밀번호 확인</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="새 비밀번호 확인"
                      {...field}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <FormMessage />

                {confirmPassword && (
                  <div className="mt-2">
                    <ValidationItem isValid={passwordsMatch} text="비밀번호 일치" />
                  </div>
                )}
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !passwordValidation.isValid || !passwordsMatch}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmitting ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}
