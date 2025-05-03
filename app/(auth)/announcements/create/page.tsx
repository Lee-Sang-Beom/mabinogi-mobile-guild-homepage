import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/AuthOptions'
import { redirect } from 'next/navigation'
import AnnouncementForm from '@/app/(auth)/announcements/_component/announcement-form'

export default async function Page(){
  const session = await getServerSession(authOptions);
  if(!session || !session.user) {
    redirect("/login");
  }
  return <AnnouncementForm user={session.user} type={"CREATE"} noticeResponse={null} />
}