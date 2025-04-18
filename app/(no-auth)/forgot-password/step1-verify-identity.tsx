'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { forgotPasswordStep1FormSchema } from './schema'
import { GuildRoleOptions, JobTypeOptions } from '@/shared/constants/game'
import { GuildRoleType, JobType } from '@/shared/types/game'
import { useFindPasswordStep1 } from '@/app/(no-auth)/forgot-password/hooks/use-find-password-step1'
import { User } from 'next-auth'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

type Step1Props = {
  onSuccessAction: (user: User) => void
  onFailureAction: () => void
}

export default function Step1VerifyIdentity({ onSuccessAction, onFailureAction }: Step1Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { mutate: findUserForPasswordReset } = useFindPasswordStep1(
    onSuccessAction,
    onFailureAction,
    () => setIsSubmitting(false),
  )

  const form = useForm<z.infer<typeof forgotPasswordStep1FormSchema>>({
    resolver: zodResolver(forgotPasswordStep1FormSchema),
    defaultValues: {
      id: "",
      job: JobTypeOptions[0].value as JobType,
      role: GuildRoleOptions[0].value as GuildRoleType,
      otp:''
    },
  })


  const onSubmit = (values: z.infer<typeof forgotPasswordStep1FormSchema>) => {
    setIsSubmitting(true)
    findUserForPasswordReset(values)
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
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">캐릭터 이름</FormLabel>
                <FormControl>
                  <Input
                    placeholder="게임 내 캐릭터 이름"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="job"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">직업</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full ">
                      <SelectValue placeholder="직업 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full ">
                    {JobTypeOptions.map((job) => {
                      return (
                        <SelectItem value={job.value} key={job.value}>
                          {job.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">길드 등급</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="길드 등급 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
                    {GuildRoleOptions.map((role) => {
                      return (
                        <SelectItem value={role.value} key={role.value}>
                          {role.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel  className="text-foreground">PIN 번호 (회원가입 시 입력한 번호)</FormLabel>
                <FormControl>
                  <InputOTP
                    {...field}
                    maxLength={6}
                  >
                    <InputOTPGroup
                    >
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator
                      className={"text-foreground"}
                    />
                    <InputOTPGroup
                    >
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage>
                  {form.formState.errors.otp?.message}
                </FormMessage>
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              {isSubmitting ? "확인 중..." : "다음 단계로"}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}
