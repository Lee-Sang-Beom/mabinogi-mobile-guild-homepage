import LoginForm from "./login-form";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/AuthOptions'
import { redirect } from 'next/navigation'

export default async function Page() {
    const session = await getServerSession(authOptions)
    if(session) {
        redirect("/dashboard")
    }
    return <LoginForm />;
}
