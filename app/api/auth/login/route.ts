import prisma from "@/lib/prisma"
import { verifyDjangoPassword } from "@/lib/verifyDjangoPassword"
import { getSession } from "@/lib/session"

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const user = await prisma.users_customuser.findUnique({
    where: { username },
    select: { id: true, username: true, email: true, password: true, is_staff: true, role: true }
  })

  if (!user) {
    return Response.json({ message: "Invalid username or password." }, { status: 401 })
  }

  const valid = await verifyDjangoPassword(password, user.password)

  if (!valid) {
    return Response.json({ message: "Invalid username or password." }, { status: 401 })
  }

  if (!(user.role === "admin" || user.is_staff)) {
    return Response.json({ message: "You are not authorized to login." }, { status: 403 })
  }

  const session = await getSession()
  session.user = {
    id: user.id.toString(),
    username: user.username,
    email: user.email ?? "",
  }
  await session.save()

  return Response.json({ success: true })
}