'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import ScheduleCalendar from '@/app/(auth)/schedule/_component/schedule-calendar'
import { ScheduleFormSchema, scheduleFormSchema } from './schema'
import EditScheduleDialog from '@/app/(auth)/schedule/_component/edit-schedule-dialog'
import ScheduleList from '@/app/(auth)/schedule/_component/schedule-list'
import { ScheduleResponse } from './api'
import { ScheduleRecruitForm } from '@/app/(auth)/schedule/internal'
import moment from 'moment'
import { User } from 'next-auth'
import { useAddSchedule } from '@/app/(auth)/schedule/hooks/use-add-schedule'

// 이벤트에 대한 모의 데이터
const initialEvents: ScheduleResponse[] = []

interface ScheduleFormProps {
  user: User
}
export default function SchedulePage({user}: ScheduleFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<ScheduleResponse[]>(initialEvents)
  const [filteredEvents, setFilteredEvents] = useState<ScheduleResponse[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<ScheduleResponse | null>(null)

  // add hooks
  const addScheduleMutation = useAddSchedule()

  const addScheduleForm = useForm<ScheduleFormSchema>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      date: new Date(),
      time: '00:00',

      title: `${user.id}님의 파티에서 파티원을 모집합니다.`,
      content: '',
      maxParticipateCount: '4',

      participateWriteUser:{
        participateUserIsSubUser: false,
        participateUserParentDocId: null,
        participateUserDocId: user.docId,
        participateUserId: user.id,
        participateUserJob: user.job
      },

      participateEtcUser: []
    },
  })

  const editScheduleForm = useForm<ScheduleFormSchema>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      date: new Date(),
      time: '00:00',

      title: `${user.id}님의 파티에서 파티원을 모집합니다.`,
      content: '',
      maxParticipateCount: '4',

      participateWriteUser:{
        participateUserIsSubUser: false,
        participateUserParentDocId: null,
        participateUserDocId: user.docId,
        participateUserId: user.id,
        participateUserJob: user.job
      },

      participateEtcUser: []
    },
  })

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasEvents = events.some((event) => {
        const eventDate = new Date(event.date)
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        )
      })
      return hasEvents ? <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-1"></div> : null
    }
    return null
  }

  useEffect(() => {
    const filtered = events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getFullYear() === selectedDate.getFullYear() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getDate() === selectedDate.getDate()
      )
    })
    setFilteredEvents(filtered)
  }, [selectedDate, events])

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


  const onEdit = (values: ScheduleFormSchema) => {
    if (currentEvent) {
      const updatedEvents = events.map((event) =>
        event === currentEvent
          ? {
            ...event,
            date: values.date.toISOString(),
            time: values.time,
            content: values.content,
            title: values.content,
            mngDt: new Date().toISOString(),
          }
          : event
      )
      setEvents(updatedEvents)
      editScheduleForm.reset()
      setIsEditDialogOpen(false)
      setCurrentEvent(null)
    }
  }

  const handleEditEvent = (event: ScheduleResponse) => {
    const eventDate = new Date(event.date)
    setCurrentEvent(event)
    editScheduleForm.reset({
      date: eventDate,
      time: event.time,
      content: event.content,
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteEvent = (docId: string) => {
    console.log(docId)
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* 애니메이션 배경 */}
      <motion.div
        className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 20, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-1/4 bottom-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-amber-500/10 to-red-500/10 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 25, ease: 'easeInOut', delay: 2 }}
      />

      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              일정 관리
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">길드 일정을 확인하고 관리할 수 있습니다.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ScheduleCalendar
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            tileContent={tileContent}
            onAdd={onAdd}
            addScheduleForm={addScheduleForm}
            user={user}
          />

          <ScheduleList
            selectedDate={selectedDate}
            filteredEvents={filteredEvents}
            handleEditEvent={handleEditEvent}
            handleDeleteEvent={handleDeleteEvent}
          />
        </div>
      </div>

      <EditScheduleDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        editScheduleForm={editScheduleForm}
        onEdit={onEdit}
      />
    </div>
  )
}
