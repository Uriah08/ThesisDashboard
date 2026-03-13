import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import UsersPage from "./Users"

export default async function Users() {
  const session = await getSession()

  if (!session.user) redirect("/auth/sign-in")

  return <UsersPage user={session.user}/>
}