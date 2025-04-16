"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  characterName: z.string().min(2, {
    message: "캐릭터 이름은 최소 2자 이상이어야 합니다.",
  }),
  email: z.string().email({
    message: "유효한 이메일 주소를 입력해주세요.",
  }),
  job: z.string({
    required_error: "직업을 선택해주세요.",
  }),
  guildRank: z.string({
    required_error: "길드 등급을 선택해주세요.",
  }),
})

type Step1Props = {
  onSuccess: () => void
  onFailure: () => void
}

export default function Step1VerifyIdentity({ onSuccess, onFailure }: Step1Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      characterName: "",
      email: "",
      job: "",
      guildRank: "",
    },
  })

  const jobs = ["전사", "마법사", "궁수", "도적", "음악가", "연금술사"]
  const guildRanks = ["길드원", "부길드장", "길드장"]

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // 여기서는 데모를 위해 간단한 검증 로직을 사용합니다.
    // 실제로는 서버에 요청을 보내 사용자 정보를 확인해야 합니다.
    setTimeout(() => {
      // 데모 목적으로 특정 값일 때 성공, 그렇지 않으면 실패로 처리합니다.
      // 실제 구현에서는 이 부분을 서버 검증으로 대체해야 합니다.
      if (values.email === "demo@example.com" && values.characterName === "demo") {
        onSuccess()
      } else {
        onFailure()
      }
      setIsSubmitting(false)
    }, 1500)
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
            name="characterName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">캐릭터 이름</FormLabel>
                <FormControl>
                  <Input
                    placeholder="게임 내 캐릭터 이름"
                    {...field}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">이메일</FormLabel>
                <FormControl>
                  <Input
                    placeholder="회원가입 시 사용한 이메일"
                    {...field}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
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
                <FormLabel className="text-gray-300">직업</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="직업 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {jobs.map((job) => (
                      <SelectItem key={job} value={job}>
                        {job}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guildRank"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">길드 등급</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="길드 등급 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {guildRanks.map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
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
