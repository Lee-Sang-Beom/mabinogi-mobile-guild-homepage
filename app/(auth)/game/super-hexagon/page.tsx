import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/AuthOptions";
import { redirect } from "next/navigation";
import SuperHexagonClientWrapper from "./_component/super-hexagon-client-wrapper";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return <SuperHexagonClientWrapper user={session.user} />;
}
