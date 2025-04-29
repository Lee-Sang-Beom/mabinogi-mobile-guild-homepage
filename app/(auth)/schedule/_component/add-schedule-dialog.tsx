import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Calendar as ReactCalendar } from 'react-calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { addScheduleFormType, onAddType, TimeOptionsType } from '@/app/(auth)/schedule/schema'
import { jobTypeOptions, participateCountList } from '@/shared/constants/game'
import { useGetSubusersBydocId } from '@/app/(auth)/profile/hooks/use-get-subusers-bydocid'
import { User } from 'next-auth'
import { ParticipateForm } from '@/app/(auth)/schedule/internal'

interface AddScheduleDialogProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: Dispatch<SetStateAction<boolean>>;
  addScheduleForm: addScheduleFormType;
  onAdd: onAddType;
  timeOptions: TimeOptionsType;
  user: User
}

export default function AddScheduleDialog({
                                            isAddDialogOpen,
                                            setIsAddDialogOpen,
                                            addScheduleForm,
                                            onAdd,
                                            timeOptions,
                                            user
                                          }: AddScheduleDialogProps) {
  const { data } = useGetSubusersBydocId(user.docId);
  const [myUserList, setMyUserList] = useState<ParticipateForm[]>([]);

  useEffect(() => {
    // 대표캐릭터 정보
    const representCharacterData: ParticipateForm[] = [
      {
        participateUserIsSubUser: false,
        participateUserParentDocId: user.docId,
        participateUserDocId: user.docId,
        participateUserId: user.id,
        participateUserJob: user.job,
      }
    ]
    
    // 서브캐릭터 정보
    const subCharacterData: ParticipateForm[] = data && data.length > 0 ? data.map((sub) => {
      return {
        participateUserIsSubUser: true,
        participateUserParentDocId: user.docId,
        participateUserDocId: sub.docId,
        participateUserId: sub.id,
        participateUserJob:  sub.job,
      }
    }) : [];

    // 세팅
    setMyUserList([
      ...representCharacterData,
      ...subCharacterData
    ])
  }, [user, data])

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> 일정 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>일정 추가</DialogTitle>
          <DialogDescription>새로운 일정 정보를 입력하세요.</DialogDescription>
        </DialogHeader>
        <Form {...addScheduleForm}>
          <form onSubmit={addScheduleForm.handleSubmit(onAdd)} className="space-y-4">
            <FormField
              control={addScheduleForm.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="calendar-container">
                    <ReactCalendar
                      onChange={field.onChange}
                      value={field.value}
                      className="w-full border rounded-md"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={addScheduleForm.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>파티 출발 시간</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={"w-full"}>
                        <SelectValue placeholder="시간 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={addScheduleForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>파티 소개 제목</FormLabel>
                  <FormControl>
                    <Input placeholder="파티 소개 제목 입력" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={addScheduleForm.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>파티 소개 내용</FormLabel>
                  <FormControl>
                    <Input placeholder="파티 소개 내용 입력" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {myUserList.length > 0 ?
              <>
                <FormField
                  control={addScheduleForm.control}
                  name="participateWriteUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>참여 캐릭터 선택</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const selectedCharacter = myUserList.find(user => user.participateUserDocId === value);

                          if (selectedCharacter) {
                            field.onChange(selectedCharacter);
                            addScheduleForm.setValue('participateWriteUser.participateUserJob', selectedCharacter.participateUserJob);
                          }
                        }}
                        defaultValue={field.value?.participateUserDocId || ''}
                      >
                        <FormControl>
                          <SelectTrigger className={"w-full"}>
                            <SelectValue placeholder="파티원 수 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {myUserList.map((character) => (
                            <SelectItem key={character.participateUserDocId} value={character.participateUserDocId}>
                              {character.participateUserId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={addScheduleForm.control}
                  name="participateWriteUser.participateUserJob" // nested field
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>참여 캐릭터 직업</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value} // value로 동적으로 변경되는 직업 값
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </>
              : <></>}



            <FormField
              control={addScheduleForm.control}
              name="maxParticipateCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>총 파티원 수 (본인 포함)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={"w-full"}>
                        <SelectValue placeholder="파티원 수 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {participateCountList.map((count) => (
                        <SelectItem key={count.name} value={count.value}>
                          {count.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} type="button">
                취소
              </Button>
              <Button type="submit">추가</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

  )
}