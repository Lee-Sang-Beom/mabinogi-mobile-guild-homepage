import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon } from 'lucide-react'
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
import ScheduleListItem from '@/app/(auth)/schedule/_component/schedule-list-item'


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

  // 파티 참가에 대한 form
  const participateScheduleForm = useForm<ParticipatePartyFormSchema>({
    resolver: zodResolver(participatePartyFormSchema),
    defaultValues: {
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
    
    setSelectSchedule(data)
    setIsEditDialogOpen(true)
  }

  // 작성자가 자신이 아닐 때 발생
  const handleParticipateEvent = (data: ScheduleResponse) => {
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
                  <ScheduleListItem
                    key={schData.docId}
                    schData={schData}
                    user={user}
                    handleEditEvent={handleEditEvent}
                    handleDeleteEvent={handleDeleteEvent}
                    handleParticipateEvent={handleParticipateEvent}
                  />
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
        selectSchedule={selectSchedule}

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