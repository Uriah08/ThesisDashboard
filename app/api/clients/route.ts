import prisma from "@/lib/prisma"
import { serialize } from "@/lib/serializer"
import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const users = await prisma.users_customuser.findMany({
    orderBy: { date_joined: "desc" },
    select: {
      id: true,
      username: true,
      first_name: true,
      last_name: true,
      email: true,
      role: true,
      is_active: true,
      is_staff: true,
      is_superuser: true,
      is_complete: true,
      profile_picture: true,
      mobile_number: true,
      address: true,
      birthday: true,
      date_joined: true,
      last_login: true,
      _count: {
        select: {
          farms_farmmodel: true,
          farms_farmmodel_members: true,
          announcements_announcementmodel: true,
          trays_sessiontraymodel: true,
        },
      },
    },
  })

  return NextResponse.json(serialize(users))
}