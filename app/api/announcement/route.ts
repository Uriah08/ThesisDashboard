import prisma from "@/lib/prisma"
import { serialize } from "@/lib/serializer"
import { getSession } from "@/lib/session"
import { sendPushNotification } from "@/lib/push"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const adminUsers = await prisma.users_customuser.findMany({
    where: { role: "admin" },
    select: { id: true },
  })

  const adminIds = adminUsers.map(u => String(u.id))

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

  const { title, body, expires_at, farm_ids } = await req.json()

  if (!title || !body) {
    return NextResponse.json({ message: "title and body are required" }, { status: 400 })
  }

  const now = new Date()

  // 1. Create the notification record
  const notification = await prisma.notifications_notification.create({
    data: {
      title: `${title}`,
      type: "announcement",
      body,
      data: {
        created_by: String(session.user.id),
        expires_at: expires_at ?? null,
        // null = all users; array of strings = specific farms
        farm_ids: farm_ids && farm_ids.length > 0 ? farm_ids : null,
      },
      created_at: now,
      updated_at: now,
    },
  })

  // 2. Resolve target user IDs
  let userIds: bigint[]

  if (farm_ids && farm_ids.length > 0) {
    // Get all members of the selected farms
    const memberships = await prisma.farms_farmmodel_members.findMany({
      where: {
        farmmodel_id: { in: farm_ids.map((id: string) => BigInt(id)) },
        // Exclude the sender
        customuser_id: { not: BigInt(session.user.id) },
      },
      select: { customuser_id: true },
    })

    // Also include farm owners (in case they are not in members table)
    const farms = await prisma.farms_farmmodel.findMany({
      where: {
        id: { in: farm_ids.map((id: string) => BigInt(id)) },
        owner_id: { not: BigInt(session.user.id) },
      },
      select: { owner_id: true },
    })

    const memberIds = memberships.map(m => m.customuser_id)
    const ownerIds = farms.map(f => f.owner_id)

    // Deduplicate
    const uniqueIds = [...new Map(
      [...memberIds, ...ownerIds].map(id => [String(id), id])
    ).values()]

    // Filter to only active users
    const activeUsers = await prisma.users_customuser.findMany({
      where: { id: { in: uniqueIds }, is_active: true },
      select: { id: true },
    })

    userIds = activeUsers.map(u => u.id)
  } else {
    // All active users except the sender
    const allUsers = await prisma.users_customuser.findMany({
      where: { id: { not: BigInt(session.user.id) }, is_active: true },
      select: { id: true },
    })
    userIds = allUsers.map(u => u.id)
  }

  if (userIds.length === 0) {
    return NextResponse.json(
      { detail: "No recipients found for the selected farms", data: serialize(notification) },
      { status: 201 }
    )
  }

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
    { detail: "Announcement sent", data: serialize(notification) },
    { status: 201 }
  )
}