import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import FarmsPage from "./Farms"

export default async function Farm() {
  const session = await getSession()

  if (!session.user) redirect("/auth/sign-in")

  return <FarmsPage user={session.user} />
}