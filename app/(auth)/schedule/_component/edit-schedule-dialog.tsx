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
import { addScheduleFormType, ScheduleFormSchema } from '@/app/(auth)/schedule/schema'
import { generateTimeOptions } from '@/shared/utils/utils'

interface EditScheduleDialogProps {
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  editScheduleForm: addScheduleFormType
  onEdit: (values: ScheduleFormSchema) => void

}

export default function EditScheduleDialog({
                                             isEditDialogOpen,
                                             setIsEditDialogOpen,
                                             editScheduleForm,
                                             onEdit,
                                           }: EditScheduleDialogProps) {

  const timeOptions = generateTimeOptions()

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
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
                  <FormLabel>날짜</FormLabel>
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
                  <FormLabel>시간</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>일정 내용</FormLabel>
                  <FormControl>
                    <Input placeholder="일정 내용을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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