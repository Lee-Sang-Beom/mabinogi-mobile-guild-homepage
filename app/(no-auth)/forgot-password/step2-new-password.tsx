'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Check, Eye, EyeOff, X } from 'lucide-react'
import { forgotPasswordStep2FormSchema } from '@/app/(no-auth)/forgot-password/schema'
import { User } from 'next-auth'
import { useFindPasswordStep2 } from '@/app/(no-auth)/forgot-password/hooks/use-find-password-step2'


type Step2Props = {
  onSuccessAction: () => void
  onFailureAction: () => void
  user: User
}

export default function Step2NewPassword({ user, onSuccessAction, onFailureAction }: Step2Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { mutate: changePassword } = useFindPasswordStep2(
    user,
    onSuccessAction,
    onFailureAction,
    () => setIsSubmitting(false),
  )

  const form = useForm<z.infer<typeof forgotPasswordStep2FormSchema>>({
    resolver: zodResolver(forgotPasswordStep2FormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)

    return {
      minLength,
      hasLowercase,
      hasNumber,
      hasSpecial,
      isValid: minLength  && hasLowercase && hasNumber && hasSpecial,
    }
  }

  const password = form.watch("password")
  const passwordValidation = validatePassword(password)
  const confirmPassword = form.watch("confirmPassword")
  const passwordsMatch = password === confirmPassword && confirmPassword !== ""

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center space-x-2">
      {isValid ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
      <span className={`text-xs ${isValid ? "text-green-500" : "text-red-500"}`}>{text}</span>
    </div>
  )

  function onSubmit(values: z.infer<typeof forgotPasswordStep2FormSchema>) {
    changePassword(values)
  }

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
                <FormLabel className="text-foreground">새 비밀번호</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="새 비밀번호"
                      {...field}
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
                <FormLabel className="text-foreground">새 비밀번호 확인</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="새 비밀번호 확인"
                      {...field}
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
