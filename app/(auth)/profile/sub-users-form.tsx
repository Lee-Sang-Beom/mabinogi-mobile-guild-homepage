import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, User as UserIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { subUsersFormSchema } from '@/app/(auth)/profile/schema'
import { User } from 'next-auth'
import { useGetSubusersBydocId } from '@/app/(auth)/profile/hooks/use-get-subusers-bydocid'
import { jobTypeOptions } from '@/shared/constants/game'
import { JobType } from '@/shared/types/game'
import { useCreateSubUser } from '@/app/(auth)/profile/hooks/user-create-subusers'
import { useDeleteSubUser } from '@/app/(auth)/profile/hooks/user-delete-subusers'

interface SubcharactersFormProps {
  user: User;
}

export default function SubUsersForm({user}: SubcharactersFormProps) {
  const { data } = useGetSubusersBydocId(user.docId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const { mutate: createSubUser, isPending: isAddUserPending } = useCreateSubUser(user.docId, setIsAddDialogOpen)
  const { mutate: deleteSubUser, isPending: isDeleteUserPending } = useDeleteSubUser(user.docId)

  const form = useForm<z.infer<typeof subUsersFormSchema>>({
    resolver: zodResolver(subUsersFormSchema),
    defaultValues: {
      parentDocId: user.docId,
      id: '',
      job: jobTypeOptions[0].value as JobType,
    },
  })

  function onCreateSubUser(values: z.infer<typeof subUsersFormSchema>) {
    createSubUser(values)
    form.reset()
  }

  function onDeleteSubUser(docId: string) {
    deleteSubUser(docId);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-background/50 backdrop-blur-sm border-primary/10 shadow-xl">
        <CardHeader>
          <div className="flex flex-col items-start gap-2 md:gap-0 md:flex-row md:justify-between md:items-center">
            <div>
              <CardTitle>서브캐릭터 관리</CardTitle>
              <CardDescription>내 서브캐릭터를 추가하고 관리할 수 있습니다.</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> 서브캐릭터 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>서브캐릭터 추가</DialogTitle>
                  <DialogDescription>새로운 서브캐릭터 정보를 입력하세요.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onCreateSubUser)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>서브 캐릭터 이름</FormLabel>
                          <FormControl>
                            <Input placeholder="서브 캐릭터 이름" {...field} />
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
                                )
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage>
                            {form.formState.errors.job?.message}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} type="button">
                        취소
                      </Button>
                      <Button type="submit" disabled={isAddUserPending}>{isAddUserPending ? '추가중...' : '추가'}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!data || data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              등록된 서브캐릭터가 없습니다. 서브캐릭터를 추가해보세요.
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((subUser) => (
                <div
                  key={subUser.docId}
                  className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-primary/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{subUser.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {subUser.job}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteSubUser(subUser.docId)}
                    className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    disabled={isDeleteUserPending}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}