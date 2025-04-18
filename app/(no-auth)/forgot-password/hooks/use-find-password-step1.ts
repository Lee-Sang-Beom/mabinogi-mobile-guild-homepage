import { useMutation } from '@tanstack/react-query'
import { userService } from '@/service/user-service'
import { forgotPasswordStep1FormSchema } from '@/app/(no-auth)/forgot-password/schema'
import { z } from 'zod'
import { User } from 'next-auth'

export const useFindPasswordStep1 = (
  onSuccessAction: (user:User) => void,
  onFailureAction: () => void,
  onSettled: () => void,
) => {
  return useMutation({
    mutationFn: (values: z.infer<typeof forgotPasswordStep1FormSchema>) =>
      userService.findUserForPasswordReset(values),
    onSuccess: (res) => {
      if (res.success && res.data) {
        const user: User = res.data
        onSuccessAction(user)
      } else {
        onFailureAction()
      }
    },
    onError: () => {
      onFailureAction()
    },
    onSettled,
  })
}