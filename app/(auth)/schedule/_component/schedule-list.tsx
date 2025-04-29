import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, Clock, Edit, Trash2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ScheduleResponse } from '@/app/(auth)/schedule/api'
import EditScheduleDialog from '@/app/(auth)/schedule/_component/edit-schedule-dialog'
import {
  participatePartyFormSchema,
  ParticipatePartyFormSchema,
  scheduleFormSchema,
  ScheduleFormSchema,
} from '@/app/(auth)/schedule/schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { User } from 'next-auth'
import { generateTimeOptions } from '@/shared/utils/utils'
import ParticipateScheduleDialogProps from '@/app/(auth)/schedule/_component/participate-schedule-dialog'


interface ScheduleListProps {
  selectedDate: Date
  handleDeleteEvent: (docId: string) => void
  scheduleData: ScheduleResponse[]
  user: User
}

export default function ScheduleList({
                                       selectedDate,
                                       handleDeleteEvent,
                                       scheduleData,
                                       user,
                                     }: ScheduleListProps) {

  const timeOptions = generateTimeOptions()
  const [selectSchedule, setSelectSchedule] = useState<ScheduleResponse | null>(null)

  // dialog open
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isParticipateDialogOpen, setIsParticipateDialogOpen] = useState(false)

  // form
  const editScheduleForm = useForm<ScheduleFormSchema>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      docId: null,
      date: new Date(),
      time: '00:00',

      title: `${user.id}님의 파티에서 파티원을 모집합니다.`,
      content: '',
      maxParticipateCount: '4',

      participateWriteUser: {
        participateUserIsSubUser: false,
        participateUserParentDocId: user.docId,
        participateUserDocId: user.docId,
        participateUserId: user.id,
        participateUserJob: user.job,
      },

      participateEtcUser: [],
    },
  })
  const participateScheduleForm = useForm<ParticipatePartyFormSchema>({
    resolver: zodResolver(participatePartyFormSchema),
    defaultValues: {
      docId: null,
      participateUser: {
        participateUserIsSubUser: false,
        participateUserParentDocId: user.docId,
        participateUserDocId: user.docId,
        participateUserId: user.id,
        participateUserJob: user.job
      }
    },
  })


  // 작성자가 자신일 때 발생
  const handleEditEvent = (data: ScheduleResponse) => {
    const newFormValues: ScheduleFormSchema = {
      ...data,
      maxParticipateCount: data.maxParticipateCount.toString(),
      date: new Date(data.date),
    }
    editScheduleForm.reset(newFormValues)
    setIsEditDialogOpen(true)
  }

  // 작성자가 자신이 아닐 때 발생
  const handleParticipateEvent = (data: ScheduleResponse) => {
    console.log('data is ', data)
    setSelectSchedule(data)
    setIsParticipateDialogOpen(true)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card
          className="bg-background/80 backdrop-blur-sm border-primary/10 shadow-xl h-full max-h-[430px] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span>
                    {selectedDate.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!scheduleData || scheduleData.length == 0 ? (
              <div className="text-center py-8 text-muted-foreground">선택한 날짜에 등록된 일정이 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {scheduleData.map((schData) => (
                  <div key={schData.docId} className="p-4 bg-background/50 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">{schData.time}</span>
                    </div>
                    <p className="mb-3">{schData.title}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs text-muted-foreground">등록자: {schData.participateWriteUser.participateUserId}</span>
                      {
                        schData.userDocId === user.docId ?
                          <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditEvent(schData)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            onClick={() => handleDeleteEvent(schData.docId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>:
                          <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-auto px-2 hover:bg-background"
                            onClick={() => handleParticipateEvent(schData)}
                          >
                            <UserPlus /> 파티가입
                          </Button>
                        </div>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/*내 작성글 관리 다이얼로그*/}
      <EditScheduleDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        editScheduleForm={editScheduleForm}
        timeOptions={timeOptions}
        user={user}
      />

      {/*파티가입 다이얼로그*/}
      <ParticipateScheduleDialogProps
        isParticipateDialogOpen={isParticipateDialogOpen}
        setIsParticipateDialogOpen={setIsParticipateDialogOpen}
        participateScheduleForm={participateScheduleForm}
        selectSchedule={selectSchedule}
        setSelectSchedule={setSelectSchedule}
        user={user}
      />
    </>

  )
}