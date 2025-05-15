import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/AuthOptions";
import { redirect } from "next/navigation";
import InquiryRequestForm from "@/app/(auth)/inquiry/_component/inquiry-request-form";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  return (
    <InquiryRequestForm
      user={session.user}
      type={"CREATE"}
      inquiryData={null}
    />
  );
}
