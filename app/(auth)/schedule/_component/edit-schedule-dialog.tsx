import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Calendar as ReactCalendar } from 'react-calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { editScheduleFormType, ScheduleFormSchema, TimeOptionsType } from '@/app/(auth)/schedule/schema'
import { jobTypeOptions, participateCountList } from '@/shared/constants/game'
import { User } from 'next-auth'
import { useGetSubusersBydocId } from '@/app/(auth)/profile/hooks/use-get-subusers-bydocid'
import { useEffect, useState } from 'react'
import { ParticipateForm, ScheduleRecruitForm } from '@/app/(auth)/schedule/internal'
import moment from 'moment/moment'
import { useUpdateScheduleMutation } from '@/app/(auth)/schedule/hooks/use-update-schedule'
import { ScheduleResponse } from '@/app/(auth)/schedule/api'
import { toast } from 'sonner'
import { Users, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface EditScheduleDialogProps {
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  editScheduleForm: editScheduleFormType
  timeOptions: TimeOptionsType;
  user: User
  selectSchedule: ScheduleResponse | null
}

export default function EditScheduleDialog({
                                             isEditDialogOpen,
                                             setIsEditDialogOpen,
                                             editScheduleForm,
                                             timeOptions,
                                             user,
                                             selectSchedule
                                           }: EditScheduleDialogProps) {

  const { data } = useGetSubusersBydocId(user.docId);
  const [myUserList, setMyUserList] = useState<ParticipateForm[]>([]);
  const [excludedUsers, setExcludedUsers] = useState<string[]>([]);

  const { mutate: updateSchedule } = useUpdateScheduleMutation();

  const onEdit = (formData: ScheduleFormSchema) => {
    // docId가 없으면 무시
    if (!selectSchedule) return;
    


    const filteredEtcUsers = formData.participateEtcUser.filter(
      (user) => !excludedUsers.includes(user.participateUserDocId)
    );

    // 제한인원 조건 검사 : 이미 가입된 인원이 있을경우, 제한인원은 기타인원 + 본인(1명) 이상이어야 함
    if (Number(formData.maxParticipateCount) < filteredEtcUsers.length + 1) {
      toast.error('파티에 이미 가입된 총 인원수보다 제한 인원이 적을 수 없습니다.');
      return;
    }

    const postData: ScheduleRecruitForm  = {
      ...formData,
      participateEtcUser: filteredEtcUsers,
      date: moment(formData.date).format("YYYY-MM-DD"),
      maxParticipateCount: Number(formData.maxParticipateCount),
      userDocId: user.docId,
      mngDt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
    }
    console.log('postData is ', postData)

    updateSchedule(
      { docId: selectSchedule.docId, data: postData },
      {
        onSuccess: () => {
          editScheduleForm.reset();
          setIsEditDialogOpen(false);
        },
      }
    );
  };

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


  const handleKickUser = (docId: string) => {
    setExcludedUsers(prev => [...prev, docId]);
  };


  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px] max-h-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>일정 수정</DialogTitle>
          <DialogDescription>일정 정보를 수정하세요.</DialogDescription>
        </DialogHeader>
        <Form {...editScheduleForm}>
          <form onSubmit={editScheduleForm.handleSubmit(onEdit)} className="space-y-4">
            <FormField
              control={editScheduleForm.control}
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
              control={editScheduleForm.control}
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
              control={editScheduleForm.control}
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
              control={editScheduleForm.control}
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
                  control={editScheduleForm.control}
                  name="participateWriteUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>참여 캐릭터 선택</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const selectedCharacter = myUserList.find(user => user.participateUserDocId === value);

                          if (selectedCharacter) {
                            field.onChange(selectedCharacter);
                            editScheduleForm.setValue('participateWriteUser.participateUserJob', selectedCharacter.participateUserJob);
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
                  control={editScheduleForm.control}
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
              control={editScheduleForm.control}
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

            {/* ✅ 파티원 목록 + 추방 기능 */}
            <FormField
              control={editScheduleForm.control}
              name="participateEtcUser"
              render={({ field }) => {
                const visibleUsers = field.value?.filter(
                  (user) => !excludedUsers.includes(user.participateUserDocId)
                ) || [];

                return (
                  <FormItem>
                    <FormLabel>참여 중인 파티원 (본인 제외)</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {visibleUsers.length === 0 && (
                        <div className="w-full text-sm text-muted-foreground p-2 border rounded-md flex items-center gap-1 bg-gray-200/50"> <Users className={"w-4 h-4"}/> 현재 파티원이 없습니다.</div>
                      )}
                      {visibleUsers.map((user) => (
                        <Badge key={user.participateUserDocId} className="flex items-center gap-1">
                          <span>{user.participateUserId} / {user.participateUserJob}</span>
                          <button
                            type="button"
                            onClick={() => handleKickUser(user.participateUserDocId)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} type="button">
                취소
              </Button>
              <Button type="submit">수정</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

  )
}