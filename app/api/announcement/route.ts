import prisma from "@/lib/prisma"
import { serialize } from "@/lib/serializer"
import { getSession } from "@/lib/session"
import { sendPushNotification } from "@/lib/push"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  // Get all admin user IDs first
  const adminUsers = await prisma.users_customuser.findMany({
    where: { role: "admin" },
    select: { id: true },
  })

  const adminIds = adminUsers.map(u => String(u.id))

  // Only return announcements created by admin users
  const allNotifications = await prisma.notifications_notification.findMany({
    where: { type: "announcement" },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      data: true,
      created_at: true,
      updated_at: true,
    },
  })

  const notifications = allNotifications.filter(n => {
    const data = n.data as { created_by?: string }
    return adminIds.includes(data?.created_by ?? "")
  })

  return NextResponse.json(serialize(notifications))
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { title, body, expires_at } = await req.json()

  if (!title || !body) {
    return NextResponse.json({ message: "title and body are required" }, { status: 400 })
  }

  const now = new Date()

  // 1. Create the notification record
  const notification = await prisma.notifications_notification.create({
    data: {
      title: `Announcement: ${title}`,
      type: "announcement",
      body,
      data: {
        created_by: String(session.user.id),
        expires_at: expires_at ?? null,
      },
      created_at: now,
      updated_at: now,
    },
  })

  // 2. Get all active users except the sender
  const allUsers = await prisma.users_customuser.findMany({
    where: { id: { not: BigInt(session.user.id) }, is_active: true },
    select: { id: true },
  })

  const userIds = allUsers.map(u => u.id)

  // 3. Bulk-create recipients
  await prisma.notifications_recipient.createMany({
    data: userIds.map(userId => ({
      notification_id: notification.id,
      user_id: userId,
      read: false,
      created_at: now,
    })),
    skipDuplicates: true,
  })

  // 4. Fetch device tokens and fire push notifications
  const deviceTokens = await prisma.notifications_devicetoken.findMany({
    where: { user_id: { in: userIds } },
    select: { token: true },
  })

  await Promise.allSettled(
    deviceTokens.map(({ token }) =>
      sendPushNotification(token, `Announcement: ${title}`, body)
    )
  )

  return NextResponse.json(
    { detail: "Announcement sent to all users", data: serialize(notification) },
    { status: 201 }
  )
}