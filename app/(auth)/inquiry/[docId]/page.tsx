import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/AuthOptions";
import { redirect } from "next/navigation";
import NotFound from "@/app/not-found";
import { inquiryService } from "@/service/inquiry-service";
import InquiryDetailPage from "@/app/(auth)/inquiry/[docId]/_component/detail-inquiry";

interface PageProps {
  params: Promise<{
    docId: string;
  }>;
}

export default async function Page(props: PageProps) {
  const { docId } = await props.params;

  const response = await inquiryService.getByDocId(docId);
  if (!response.success || !response.data) {
    return <NotFound />;
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  return <InquiryDetailPage user={session.user} inquiryData={response.data} />;
}
