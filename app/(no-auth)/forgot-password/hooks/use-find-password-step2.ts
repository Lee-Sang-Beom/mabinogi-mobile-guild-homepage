import { useMutation } from '@tanstack/react-query'
import { userService } from '@/service/user-service'
import { z } from 'zod'
import { forgotPasswordStep2FormSchema } from '@/app/(no-auth)/forgot-password/schema'
import { User } from 'next-auth'


export const useFindPasswordStep2 = (
  user: User,
  onSuccessAction: () => void,
  onFailureAction: () => void,
  onSettled: () => void,
) => {
  return useMutation({
    mutationFn: async (values: z.infer<typeof forgotPasswordStep2FormSchema>) => {
      return await userService.modifyPasswordCollectionUser(values.password, user)
    },
    onSuccess: (res) => {
      if (res.success) {
        onSuccessAction()
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
