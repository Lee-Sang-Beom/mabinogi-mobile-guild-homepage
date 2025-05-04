import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/AuthOptions";
import { redirect } from "next/navigation";
import CommunityForm from "../_component/community-form";
import { CommunityNoticeType } from "@/shared/notice/internal";

interface PageProps {
  searchParams: Promise<{
    tab: CommunityNoticeType;
  }>;
}

export default async function Page(props: PageProps) {
  const session = await getServerSession(authOptions);
  const { tab } = await props.searchParams;
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <CommunityForm
      user={session.user}
      type="CREATE"
      tabType={tab || "artwork"}
      noticeData={null}
    />
  );
}
