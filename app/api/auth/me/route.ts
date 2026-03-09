import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  console.log("session:", session)
  return Response.json({ user: session.user ?? null })
}