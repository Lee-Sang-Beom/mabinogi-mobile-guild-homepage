'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ScheduleCalendar from '@/app/(auth)/schedule/_component/schedule-calendar'
import ScheduleList from '@/app/(auth)/schedule/_component/schedule-list'
import { User } from 'next-auth'
import { useGetSchedules } from '@/app/(auth)/schedule/hooks/use-get-schedules'
import { useDeleteSchedule } from './hooks/use-delete-schedule'


interface ScheduleFormProps {
  user: User
}
export default function SchedulePage({user}: ScheduleFormProps) {
  // 선택한 날짜 관리
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // hooks
  const { data: schedules } = useGetSchedules(selectedDate);
  const { mutate: deleteSchedule } = useDeleteSchedule();

  // 파티구인글 삭제
  const handleDeleteEvent = (docId: string) => {
    deleteSchedule(docId);
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
          {/* 캘린더 UI 표시 영역 */}
          <ScheduleCalendar
            scheduleData={schedules?.data || []}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            user={user}
          />

          {/* 리스트 출력 */}
          <ScheduleList
            scheduleData={schedules?.data || []}
            selectedDate={selectedDate}
            handleDeleteEvent={handleDeleteEvent}
            user={user}
          />
        </div>
      </div>


    </div>
  )
}
