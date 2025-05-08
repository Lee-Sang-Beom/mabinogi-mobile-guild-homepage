import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { profileFormSchema } from "./schema";
import { User } from "next-auth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { guildRoleOptions, jobTypeOptions } from "@/shared/constants/game";
import { useUpdateUser } from "@/app/(auth)/profile/hooks/use-update-user";
import { useWithdrawnUser } from "./hooks/use-withdrawn-user";
import { useSession } from "next-auth/react";

interface ProfileForm {
  user: User;
}

export default function ProfileForm({ user }: ProfileForm) {
  const { update } = useSession();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const updateUserMutation = useUpdateUser(); // 유저 업데이트 tanstack-query
  const withdrawnUserMutation = useWithdrawnUser(); // 유저 회원탈퇴 tanstack-query
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      docId: user.docId,
      id: user.id,
      password: "",
      otp: user.otp,
      job: user.job,
      role: user.role,
    },
  });

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    updateUserMutation.mutate({
      data: values,
      currentUser: user,
      update: update,
    });
  }

  function handleWithdrawn(user: User) {
    withdrawnUserMutation.mutate({
      user,
      type: "WITHDRAWN", // 또는 'REJECTED'
      redirect: true,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative bg-background/50 backdrop-blur-sm border-primary/10 shadow-xl">
        <CardHeader>
          <CardTitle>프로필 정보 수정</CardTitle>
          <CardDescription>내 계정 정보를 수정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>아이디 (캐릭터 이름)</FormLabel>
                    <FormControl>
                      <Input placeholder="게임 내 캐릭터 이름" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 (변경하려면 입력하세요)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="새 비밀번호"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      PIN 번호 (비밀번호 찾기 시 사용되는 고유한 번호입니다.)
                    </FormLabel>
                    <FormControl>
                      <InputOTP {...field} maxLength={6}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
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
                          {jobTypeOptions.map((job) => {
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
                          {guildRoleOptions.map((role) => {
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

              <div className="flex justify-between pt-4">
                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" type="button">
                      회원 탈퇴
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>회원 탈퇴</DialogTitle>
                      <DialogDescription>
                        정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수
                        없습니다.
                      </DialogDescription>
                    </DialogHeader>
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>주의</AlertTitle>
                      <AlertDescription>
                        회원 탈퇴 시 모든 계정 정보가 삭제되며 복구할 수
                        없습니다.
                      </AlertDescription>
                    </Alert>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                      >
                        취소
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleWithdrawn(user);
                        }}
                      >
                        탈퇴 확인
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending
                    ? "저장 중..."
                    : "변경사항 저장"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
