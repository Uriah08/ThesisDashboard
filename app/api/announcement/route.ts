import prisma from "@/lib/prisma"
import { serialize } from "@/lib/serializer"
import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  if (session.user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 })

  const announcements = await prisma.announcements_announcementmodel.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      created_at: true,
      expires_at: true,
      users_customuser: {
        select: { id: true, username: true, profile_picture: true },
      },
    },
  })

  return NextResponse.json(serialize(announcements))
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { title, content, status, expires_at } = await req.json()

  if (session.user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 })

  if (!title || !content) {
    return NextResponse.json({ message: "title and content are required" }, { status: 400 })
  }

  const announcement = await prisma.announcements_announcementmodel.create({
    data: {
      title,
      content,
      status: status ?? "active",
      created_at: new Date(),
      created_by_id: BigInt(session.user.id),
      ...(expires_at && { expires_at: new Date(expires_at) }),
    },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      created_at: true,
      expires_at: true,
      users_customuser: {
        select: { id: true, username: true, profile_picture: true },
      },
    },
  })

  return NextResponse.json(serialize(announcement), { status: 201 })
}