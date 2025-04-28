import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as ReactCalendar } from 'react-calendar'
import { Dispatch, JSX, SetStateAction } from 'react'
import { Value } from '@/shared/types/common'
import { addScheduleFormType, onAddType } from '@/app/(auth)/schedule/schema'
import AddScheduleDialog from '@/app/(auth)/schedule/_component/add-schedule-dialog'
import { generateTimeOptions } from '@/shared/utils/utils'
import { User } from 'next-auth'

interface ScheduleCalendarProps {
  isAddDialogOpen: boolean
  setIsAddDialogOpen: Dispatch<SetStateAction<boolean>>
  selectedDate: Date
  setSelectedDate: Dispatch<SetStateAction<Date>>
  tileContent: (props: { date: Date; view: string }) => JSX.Element | null
  addScheduleForm: addScheduleFormType
  onAdd: onAddType
  user: User
}

export default function ScheduleCalendar({
                                           isAddDialogOpen,
                                           setIsAddDialogOpen,
                                           selectedDate,
                                           setSelectedDate,
                                           tileContent,
                                           addScheduleForm,
                                           onAdd,
                                           user
                                         }: ScheduleCalendarProps) {

  const timeOptions = generateTimeOptions()
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