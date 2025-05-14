import { authOptions } from "@/app/api/auth/[...nextauth]/AuthOptions";
import { getServerSession } from "next-auth";
import Home from "./(home)/_components/Home";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const user = session && session.user ? session.user : null;
  return <Home user={user} />;
}
