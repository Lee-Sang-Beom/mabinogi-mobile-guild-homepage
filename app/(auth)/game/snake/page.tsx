import SnakeGame from "@/app/(auth)/game/snake/_component/snake-game";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/AuthOptions";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  return <SnakeGame user={session.user} />;
}
