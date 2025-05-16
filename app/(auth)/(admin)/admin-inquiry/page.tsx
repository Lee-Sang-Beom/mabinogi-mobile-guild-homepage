import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/AuthOptions";
import { redirect } from "next/navigation";
import AdminInquiriesList from "@/app/(auth)/(admin)/admin-inquiry/_component/admin-Inquiries-list";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  return <AdminInquiriesList user={session.user} />;
}
