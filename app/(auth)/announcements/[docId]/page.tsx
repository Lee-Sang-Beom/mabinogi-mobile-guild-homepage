import { announcementService } from '@/service/announcement-service';
import AnnouncementDetailPage from '@/app/(auth)/announcements/[docId]/_component/detail-announcements';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/AuthOptions';
import { redirect } from 'next/navigation';
import NotFound from '@/app/not-found'

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

  return <AnnouncementDetailPage user={session.user} announcementData={response.data} />;
}
