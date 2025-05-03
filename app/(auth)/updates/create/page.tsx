import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/AuthOptions'
import { redirect } from 'next/navigation'
import UpdateForm from '../_component/update-form';

export default async function Page(){
  const session = await getServerSession(authOptions);
  if(!session || !session.user) {
    redirect("/login");
  }
  return <UpdateForm user={session.user} type={"CREATE"} noticeResponse={null} />
}