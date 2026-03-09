import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import Dashboard from "./Dashboard"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session.user) redirect("/auth/sign-in")

  return <Dashboard user={session.user} />
}