import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import AnnouncementPage from "./Announcement"

export default async function Announcement() {
  const session = await getSession()

  if (!session.user) redirect("/auth/sign-in")

  return <AnnouncementPage user={session.user}/>
}