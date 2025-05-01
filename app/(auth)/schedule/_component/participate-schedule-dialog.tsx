import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ParticipatePartyFormSchema, ParticipatePartyFormType } from '@/app/(auth)/schedule/schema'
import { jobTypeOptions } from '@/shared/constants/game'
import { User } from 'next-auth'
import { useGetSubusersBydocId } from '@/app/(auth)/profile/hooks/use-get-subusers-bydocid'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ParticipateForm } from '@/app/(auth)/schedule/internal'
import { ScheduleResponse } from '@/app/(auth)/schedule/api'
import { useUpdateParticipateStatus } from '@/app/(auth)/schedule/hooks/use-update-participate-status'
import { CalendarClock, FileText, Sword, Tag, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getJobClassColor, JobClassIcons } from '@/app/(auth)/dashboard/job-class-utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ParticipateScheduleDialogProps {
  isParticipateDialogOpen: boolean
  setIsParticipateDialogOpen: (open: boolean) => void
  participateScheduleForm: ParticipatePartyFormType
  selectSchedule: ScheduleResponse | null
  setSelectSchedule: Dispatch<SetStateAction<ScheduleResponse | null>>
  user: User
}

export default function ParticipateScheduleDialogProps({
                                                         isParticipateDialogOpen,
                                                         setIsParticipateDialogOpen,
                                                         participateScheduleForm,
                                                         selectSchedule,
                                                         setSelectSchedule,
                                                         user,
                                                       }: ParticipateScheduleDialogProps) {

  // hooks - api
  const { data } = useGetSubusersBydocId(user.docId)
  const { mutate: updateParticipateStatus } = useUpdateParticipateStatus();

  // 내 캐릭터 전체리스트
  const [myUserList, setMyUserList] = useState<ParticipateForm[]>([])

  // 파티 가입여부와 가입된 유저 정보
  const [isParticipate, setIsParticipate] = useState<boolean>(false)



  /**
   * @name onParticipate
   * @param values
   * @description 파티 참여, 파티 참여 취소를 결정짓는 submit 함수
   */
  const onParticipate = (values: ParticipatePartyFormSchema) => {
    if (!selectSchedule) return;
    const scheduleDocId = selectSchedule.docId;
    const postData = values.participateUser;

    // 내가 이미 파티에 가입되어 있는가? (true)
    // 내가 이미 파티에 가입되지 있지 않아 신청할 예정이다? (false)
    const isAlreadyParticipating = (selectSchedule.participateEtcUser ?? []).some(
      (u) => u.participateUserParentDocId === postData.participateUserParentDocId
    );

    // 파티에 가입되어 있지 않은 상태에서 onParticipate가 실행된다면, 파티신청 시 파티원 구인이 마감되었는지 확인해야 함
    if (!isAlreadyParticipating && selectSchedule.maxParticipateCount <= (selectSchedule.participateEtcUser.length || 0) + 1) {
      toast.error('이미 파티원 모집이 완료된 파티입니다.');
      return;
    }

    console.log('isAlreadyParticipating ', isAlreadyParticipating)
    updateParticipateStatus(
      {
        scheduleDocId,
        participateUser: postData,
        isParticipate: isAlreadyParticipating,
      },
      {
        onSuccess: () => {
          setSelectSchedule(null);
          setIsParticipateDialogOpen(false);
        },
      }
    );
  };

  /**
   * @name useEffect
   * @description 내 대표캐릭터, 서브캐릭터를 찾아 적절한 타입으로 변환
   */
  useEffect(() => {
    // 대표캐릭터 정보
    const representCharacterData: ParticipateForm[] = [
      {
        participateUserIsSubUser: false,
        participateUserParentDocId: user.docId,
        participateUserDocId: user.docId,
        participateUserId: user.id,
        participateUserJob: user.job,
      },
    ]

    // 서브캐릭터 정보
    const subCharacterData: ParticipateForm[] = data && data.length > 0 ? data.map((sub) => {
      return {
        participateUserIsSubUser: true,
        participateUserParentDocId: user.docId,
        participateUserDocId: sub.docId,
        participateUserId: sub.id,
        participateUserJob: sub.job,
      }
    }) : []

    // 세팅
    setMyUserList([
      ...representCharacterData,
      ...subCharacterData,
    ])
  }, [user, data])

  /**
   * @name useEffect
   * @description 내 대표캐릭터, 서브캐릭터가 이 파티에 포함되어있는지 확인
   * @description 내가 파티가입을 했으면 이 scheduleParticipateUserList 각 요소의 participateUserParentDocId에는 내 user.docId가 대표캐릭터이든 서브캐릭터이든 들어가 있을 것
   */
  useEffect(() => {
    // 정보가 아예 없으면 참여하지 않고 있는 것임
    if (!selectSchedule || selectSchedule.participateEtcUser?.length == 0) {
      setIsParticipate(false)
      return
    }

    // 이제 내 정보가 이 파티에 포함되어있는지를 검사할거임
    const scheduleParticipateUserList = selectSchedule.participateEtcUser
    const alreadyIsParticipate = scheduleParticipateUserList.find((participateUser) => participateUser.participateUserParentDocId === user.docId)
    setIsParticipate(!!alreadyIsParticipate)

  }, [selectSchedule, user.docId])

  return (
    <Dialog open={isParticipateDialogOpen} onOpenChange={setIsParticipateDialogOpen}>
      <DialogContent className="sm:max-w-[480px] max-h-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>파티 가입 관리</DialogTitle>
          <DialogDescription>등록된 파티 정보와 파티 가입 및 탈퇴를 진행할 수 있습니다. </DialogDescription>
        </DialogHeader>

        <Form {...participateScheduleForm}>
          <form onSubmit={participateScheduleForm.handleSubmit(onParticipate)} className="space-y-4 relative">
            {myUserList.length > 0 ?
              <>
                {selectSchedule &&
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-4 rounded-md shadow-lg border bg-card"
                    >
                      <h3 className="text-md font-semibold mb-2">파티 정보</h3>
                      <div className="flex flex-col space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <CalendarClock className="w-4 h-4 " />
                          <strong>출발 일정:</strong> {selectSchedule.date} {selectSchedule.time}
                        </p>
                        <p className="flex items-center gap-2">
                          <Tag className="w-4 h-4 " />
                          <strong>파티 제목:</strong> {selectSchedule.title}
                        </p>
                        <p className="flex items-center gap-2">
                          <FileText className="w-4 h-4 " />
                          <strong>파티 내용:</strong> {selectSchedule.content}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users className="w-4 h-4 " />
                          <strong>최대 파티원 수:</strong> {selectSchedule.maxParticipateCount}명
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-4 rounded-md shadow-lg border bg-card"
                    >
                      <h3 className="text-md font-semibold mb-4">파티 인원</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Badge
                            className="flex items-center gap-1 bg-muted text-foreground border border-sky-500"
                            variant="outline"
                          >
                            {(() => {
                              const IconComponent = JobClassIcons[selectSchedule.participateWriteUser.participateUserJob] || Sword
                              return (
                                <IconComponent
                                  className="h-4 w-4"
                                  style={{ color: getJobClassColor(selectSchedule.participateWriteUser.participateUserJob) }}
                                />
                              )
                            })()}
                            <p>
                              {selectSchedule.participateWriteUser.participateUserId}
                              ({selectSchedule.participateWriteUser.participateUserJob})
                              <span className="ml-1 text-xs text-sky-500 font-semibold">(파티장)</span>
                            </p>
                          </Badge>
                        </motion.div>

                        {selectSchedule.participateEtcUser.map((member) => {
                          const isMe = member.participateUserParentDocId === user.docId;
                          return (
                            <motion.div key={member.participateUserDocId} whileHover={{ scale: 1.05 }}>
                              <Badge
                                className={cn("flex items-center gap-1 bg-muted text-foreground border", isMe && "border-red-400")}
                                variant="outline"
                              >
                                {(() => {
                                  const IconComponent = JobClassIcons[member.participateUserJob] || Sword
                                  return (
                                    <IconComponent
                                      className="h-4 w-4"
                                      style={{ color: getJobClassColor(member.participateUserJob) }}
                                    />
                                  )
                                })()}
                                <p>{member.participateUserId}({member.participateUserJob}) {isMe && <span className={"text-red-400 font-semibold"}>{`(내 캐릭터)`}</span>}</p>
                              </Badge>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  </div>
                }

                {isParticipate ? <p className={"text-sm w-full text-center"}>이미 가입된 파티입니다! <br/> 파티탈퇴를 원하시면, 아래 <strong>파티탈퇴</strong> 버튼을 클릭해주세요.</p> :  <>
                  <FormField
                    control={participateScheduleForm.control}
                    name="participateUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>참여 캐릭터 선택</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const selectedCharacter = myUserList.find(user => user.participateUserDocId === value)

                            if (selectedCharacter) {
                              field.onChange(selectedCharacter)
                              participateScheduleForm.setValue('participateUser.participateUserJob', selectedCharacter.participateUserJob)
                            }
                          }}
                          defaultValue={field.value?.participateUserDocId || ''}
                        >
                          <FormControl>
                            <SelectTrigger className={'w-full'}>
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
                    control={participateScheduleForm.control}
                    name="participateUser.participateUserJob" // nested field
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
                  /></>}
              </>
              : <></>}

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsParticipateDialogOpen(false)
                  setSelectSchedule(null)
                }}>
                취소
              </Button>
              <Button type="submit">{isParticipate ? '파티 탈퇴' : '파티 가입'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

  )
}