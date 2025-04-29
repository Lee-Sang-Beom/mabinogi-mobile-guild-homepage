import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as ReactCalendar } from 'react-calendar'
import { Dispatch, SetStateAction, useState } from 'react'
import { Value } from '@/shared/types/common'
import { scheduleFormSchema, ScheduleFormSchema } from '@/app/(auth)/schedule/schema'
import AddScheduleDialog from '@/app/(auth)/schedule/_component/add-schedule-dialog'
import { generateTimeOptions } from '@/shared/utils/utils'
import { User } from 'next-auth'
import { ScheduleRecruitForm } from '@/app/(auth)/schedule/internal'
import moment from 'moment/moment'
import { useAddSchedule } from '@/app/(auth)/schedule/hooks/use-add-schedule'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ScheduleResponse } from '@/app/(auth)/schedule/api'

interface ScheduleCalendarProps {
  selectedDate: Date
  setSelectedDate: Dispatch<SetStateAction<Date>>
  user: User
  scheduleData: ScheduleResponse[]

}

export default function ScheduleCalendar({
                                           selectedDate,
                                           setSelectedDate,
                                           user,
                                           scheduleData
                                         }: ScheduleCalendarProps) {
  const addScheduleMutation = useAddSchedule()
  const timeOptions = generateTimeOptions()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleDateChange = (
    value: Value,
  ) => {
    if (value instanceof Date) {
      setSelectedDate(value)
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0])
    } else {
    }
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const eventCount = scheduleData.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        );
      }).length;

      return eventCount > 0 ? (
        <div className="flex justify-center gap-[2px] mt-1">
          {Array.from({ length: eventCount }).map((_, idx) => (
            <div key={idx} className="w-1.5 h-1.5 bg-primary rounded-full" />
          ))}
        </div>
      ) : null;
    }
    return null;
  };

  const addScheduleForm = useForm<ScheduleFormSchema>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      docId: null,
      date: new Date(),
      time: '00:00',

      title: `${user.id}님의 파티에서 파티원을 모집합니다.`,
      content: '',
      maxParticipateCount: '4',

      participateWriteUser:{
        participateUserIsSubUser: false,
        participateUserParentDocId: user.docId,
        participateUserDocId: user.docId,
        participateUserId: user.id,
        participateUserJob: user.job
      },

      participateEtcUser: []
    },
  })


  const onAdd = (values: ScheduleFormSchema) => {
    const postData: ScheduleRecruitForm = {
      ...values,
      date: moment(values.date).format("YYYY-MM-DD"),
      maxParticipateCount: Number(values.maxParticipateCount),
      userDocId: user.docId,
      mngDt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
    }

    addScheduleMutation.mutate(postData, {
      onSuccess: () => {
        addScheduleForm.reset()
        setIsAddDialogOpen(false)
      }
    })
  }

  return (
    <motion.div
      className="lg:col-span-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-background/80 backdrop-blur-sm border-primary/10 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>일정 캘린더</CardTitle>
          <AddScheduleDialog
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
            addScheduleForm={addScheduleForm}
            onAdd={onAdd}
            timeOptions={timeOptions}
            user={user}
          />
        </CardHeader>
        <CardContent>
          <div
            className="calendar-wrapper [&_.react-calendar]:bg-background [&_.react-calendar__tile]:text-foreground [&_.react-calendar__month-view__days__day]:bg-background/80 [&_.react-calendar__navigation button]:text-foreground [&_.react-calendar__tile--now]:bg-primary/20 [&_.react-calendar__tile--active]:bg-primary [&_.react-calendar__tile--active]:text-primary-foreground">
            <ReactCalendar
              onChange={handleDateChange}
              value={selectedDate}
              tileContent={tileContent}
              className="w-full border-none bg-background text-foreground rounded-md shadow-sm"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}