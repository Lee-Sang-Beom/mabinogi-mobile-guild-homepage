import ProfilePage from '@/app/(auth)/profile/profile-page'
import { authOptions } from '@/app/api/auth/[...nextauth]/AuthOptions'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await getServerSession(authOptions)
  if(!session || !session.user){
    redirect("/login")
  }
  return <ProfilePage user={session!.user}/>
}
