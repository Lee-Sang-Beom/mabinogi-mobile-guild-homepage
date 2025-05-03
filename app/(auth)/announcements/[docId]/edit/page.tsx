import { announcementService } from '@/service/announcement-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/AuthOptions'
import { redirect } from 'next/navigation'
import NotFound from '@/app/not-found'
import AnnouncementForm from '@/app/(auth)/announcements/_component/announcement-form'

interface PageProps {
  params: Promise<{
    docId: string;
  }>;
}

export default async function Page(props: PageProps) {
  const { docId } = await props.params;

  const response = await announcementService.getByDocId(docId);
  if (!response.success || !response.data) {
    return <NotFound />;
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  return <AnnouncementForm user={session.user} type={"UPDATE"} noticeResponse={response.data} />
}
