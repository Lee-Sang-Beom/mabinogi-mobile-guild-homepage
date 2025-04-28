import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, Clock, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ScheduleResponse } from '@/app/(auth)/schedule/api'


interface ScheduleListProps {
  selectedDate: Date
  filteredEvents: ScheduleResponse[]
  handleEditEvent: (event: ScheduleResponse) => void
  handleDeleteEvent: (docId: string) => void
}

export default function ScheduleList({
                                       selectedDate,
                                       filteredEvents,
                                       handleEditEvent,
                                       handleDeleteEvent,
                                     }: ScheduleListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-background/80 backdrop-blur-sm border-primary/10 shadow-xl h-full">
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
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">선택한 날짜에 등록된 일정이 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.docId} className="p-4 bg-background/50 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{event.time}</span>
                  </div>
                  <p className="mb-3">{event.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">등록자: {event.docId}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => handleDeleteEvent(event.docId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}