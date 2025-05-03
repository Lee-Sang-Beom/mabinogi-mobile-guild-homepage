import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/AuthOptions'
import { redirect } from 'next/navigation'
import UpdateList from './_component/update-list';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }
  return <UpdateList user={session.user}/>
}
