import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import FarmPage from "./Farm"

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession()
  if (!session.user) redirect("/auth/sign-in")

  const { slug } = await params

  return <FarmPage user={session.user} params={{ id: slug }} />
}