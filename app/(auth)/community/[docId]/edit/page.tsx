import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/AuthOptions";
import { redirect } from "next/navigation";
import NotFound from "@/app/not-found";
import { CommunityNoticeType } from "@/shared/notice/internal";
import { communityService } from "@/service/community-service";
import CommunityForm from "../../_component/community-form";

interface PageProps {
  params: Promise<{
    docId: string;
  }>;
  searchParams: Promise<{
    tab: CommunityNoticeType;
  }>;
}

export default async function Page(props: PageProps) {
  const { docId } = await props.params;
  const { tab } = await props.searchParams;
  const response = await communityService.getByDocId(tab, docId);

  if (!response.success || !response.data) {
    return <NotFound />;
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <CommunityForm
      user={session.user}
      type={"UPDATE"}
      noticeData={response.data}
      tabType={tab || "artwork"}
    />
  );
}
