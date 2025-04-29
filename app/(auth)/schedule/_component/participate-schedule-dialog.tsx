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
import { useEffect, useState, Dispatch, SetStateAction } from 'react'
import { ParticipateForm } from '@/app/(auth)/schedule/internal'
import { ScheduleResponse } from '@/app/(auth)/schedule/api'

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

  const { data } = useGetSubusersBydocId(user.docId)
  const [myUserList, setMyUserList] = useState<ParticipateForm[]>([])
  const [isParticipate, setIsParticipate] = useState<boolean>(false)

  /**
   * @name onParticipate
   * @param values
   * @description 파티 참여, 파티 참여 취소를 결정짓는 submit 함수
   */
  const onParticipate = (values: ParticipatePartyFormSchema) => {
    console.log('selectSchedule is ', selectSchedule)
    console.log('values is ', values)

    // API 통신 개념 핵심
    // 1. 내 정보가 이미 selectSchedule의 participateEtcUser에 들어가있으면 가입이 된 상태임
    // 2. 내 정보가  selectSchedule의 participateEtcUser에 안들어가있으면 가입이 안된거임

    // API 통신 완료 시 적용
    setSelectSchedule(null)
    setIsParticipateDialogOpen(false)
  }

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
      <DialogContent className="sm:max-w-[425px] max-h-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>파티 가입 관리</DialogTitle>
          <DialogDescription>파티 가입 관리</DialogDescription>
        </DialogHeader>
        <Form {...participateScheduleForm}>
          <form onSubmit={participateScheduleForm.handleSubmit(onParticipate)} className="space-y-4">
            {myUserList.length > 0 ?
              <>
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
                />

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
              <Button type="submit">{isParticipate ? '가입취소' : '가입하기'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

  )
}