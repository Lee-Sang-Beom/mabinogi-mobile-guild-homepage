"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { joinFormSchema } from "./schema";
import { GuildRoleOptions, JobTypeOptions } from "@/shared/constants/game";
import { apiAddUser } from "@/app/api/userApi";
import { toast } from "sonner";
import { GuildRoleType, JobType } from "@/shared/types/game";
import { useRouter } from "next/navigation";

export default function JoinForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof joinFormSchema>>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      id: "",
      password: "",
      confirmPassword: "",
      job: JobTypeOptions[0].value as JobType,
      role: GuildRoleOptions[0].value as GuildRoleType,
    },
  });

  // useWatch로 password와 confirmPassword 값을 구독
  const password = useWatch({ control: form.control, name: "password" });
  const confirmPassword = useWatch({
    control: form.control,
    name: "confirmPassword",
  });

  async function onSubmit(values: z.infer<typeof joinFormSchema>) {
    setIsSubmitting(true);
    const response = await apiAddUser(values);
    setIsSubmitting(false);

    if (response.success) {
      toast.success("회원가입이 완료되었습니다.");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } else {
      toast.error(response.message);
    }
  }

  useEffect(() => {
    // 비밀번호 확인란의 값이 비밀번호와 일치하지 않으면 에러 설정
    if (password !== confirmPassword) {
      form.setError("confirmPassword", {
        type: "manual",
        message: "비밀번호가 일치하지 않습니다.",
      });
    } else {
      form.clearErrors("confirmPassword");
    }
  }, [form, password, confirmPassword]); // password, confirmPassword 값이 변경될 때마다 실행

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute left-1/4 top-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 15,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-1/4 bottom-1/4 -z-10 h-[250px] w-[250px] rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 20,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <div className="w-full max-w-2xl">
        <motion.div
          className="relative bg-background/40 backdrop-blur-sm p-8 border border-primary/10 rounded-3xl shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-3xl blur opacity-20"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
            </div>

            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground mb-8">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                길드 회원가입
              </span>
            </h2>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>아이디 (캐릭터 이름)</FormLabel>
                      <FormControl>
                        <Input placeholder="게임 내 캐릭터 이름" {...field} />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.id?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>비밀번호</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.password?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>비밀번호 확인</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.confirmPassword?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="job"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>직업</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="직업 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {JobTypeOptions.map((job) => {
                              return (
                                <SelectItem value={job.value} key={job.value}>
                                  {job.name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage>
                          {form.formState.errors.job?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>길드 내 등급</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="등급 선택" />
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
                        <FormMessage>
                          {form.formState.errors.role?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "가입 중..." : "회원가입"}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    이미 계정이 있으신가요?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      로그인
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
