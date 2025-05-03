import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/AuthOptions'
import { redirect } from 'next/navigation'
import NotFound from '@/app/not-found'
import UpdateForm from '../../_component/update-form'
import { updateService } from '@/service/update-service'

interface PageProps {
  params: Promise<{
    docId: string;
  }>;
}

export default async function Page(props: PageProps) {
  const { docId } = await props.params;

  const response = await updateService.getByDocId(docId);
  if (!response.success || !response.data) {
    return <NotFound />;
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  return <UpdateForm user={session.user} type={"UPDATE"} noticeResponse={response.data} />
}
