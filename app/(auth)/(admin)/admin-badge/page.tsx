import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/AuthOptions";
import { redirect } from "next/navigation";
import AdminBadgeTabs from "@/app/(auth)/(admin)/admin-badge/_components/AdminBadgeTabs";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  return <AdminBadgeTabs user={session.user} />;
}
