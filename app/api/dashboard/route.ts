import prisma from "@/lib/prisma"
import { serialize } from "@/lib/serializer"
import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)

  const from = searchParams.get("from")
  const to   = searchParams.get("to")

  let createdAtFilter: { gte?: Date; lte?: Date } | undefined = undefined

  if (from && to) {
    const fromDate = new Date(decodeURIComponent(from))
    const toDate   = new Date(decodeURIComponent(to))
    toDate.setHours(23, 59, 59, 999)
    createdAtFilter = { gte: fromDate, lte: toDate }
  }

  const [
    totalFarms,
    totalUsers,
    totalProduction,
    activeSessions,
    activeTrays,
    recentFarms,
    recentProduction,
    recentAnnouncements,
    usersByRole,
    recentTraySteps,
    productionList,
  ] = await Promise.all([

    prisma.farms_farmmodel.count(),

    prisma.users_customuser.count(),

    prisma.production_farmproductionmodel.aggregate({
      where: createdAtFilter ? { created_at: createdAtFilter } : undefined,
      _sum: { quantity: true },
      _count: true,
      _avg: { satisfaction: true },
    }),

    prisma.farm_sessions_farmsessionmodel.count({
      where: {
        status: "active",
        ...(createdAtFilter ? { created_at: createdAtFilter } : {}),
      },
    }),

    prisma.farm_trays_farmtraymodel.count({
      where: {
        status: "active",
        ...(createdAtFilter ? { created_at: createdAtFilter } : {}),
      },
    }),

    prisma.farms_farmmodel.findMany({
      orderBy: { create_at: "desc" },
      select: {
        id: true,
        name: true,
        create_at: true,
        image_url: true,
        users_customuser: {
          select: { username: true, email: true, profile_picture: true, first_name: true, last_name: true }
        },
        farms_farmmodel_members: { select: { id: true } },
        farm_trays_farmtraymodel: { select: { id: true } },
      }
    }),

    prisma.production_farmproductionmodel.groupBy({
      by: ["created_at"],
      where: createdAtFilter ? { created_at: createdAtFilter } : undefined,
      _sum: { quantity: true },
      _avg: { satisfaction: true },
      orderBy: { created_at: "asc" },
    }),

    // announcements from notifications table
    prisma.notifications_notification.findMany({
      orderBy: { created_at: "desc" },
      where: {
        type: "announcement",
        ...(createdAtFilter ? { created_at: createdAtFilter } : {}),
      },
      select: {
        id: true,
        title: true,
        body: true,
        data: true,
        created_at: true,
      }
    }),

    prisma.users_customuser.groupBy({
      by: ["role"],
      _count: true,
    }),

    prisma.trays_traystepmodel.findMany({
      where: createdAtFilter ? { datetime: createdAtFilter } : undefined,
      select: {
        id: true,
        title: true,
        datetime: true,
        detected: true,
        rejects: true,
      }
    }),

    // separate findMany for the recent production list card
    prisma.production_farmproductionmodel.findMany({
      orderBy: { created_at: "desc" },
      where: createdAtFilter ? { created_at: createdAtFilter } : undefined,
      select: {
        id: true,
        title: true,
        quantity: true,
        satisfaction: true,
        total: true,
        landing: true,
        created_at: true,
        farms_farmmodel: { select: { name: true } }
      }
    }),
  ])

  // Filter announcements to admin-created only
  const adminUsers = await prisma.users_customuser.findMany({
    where: { role: "admin" },
    select: { id: true, username: true },
  })
  const adminIds = adminUsers.map(u => String(u.id))

  const filteredAnnouncements = recentAnnouncements
    .filter(n => {
      const d = n.data as { created_by?: string }
      return adminIds.includes(d?.created_by ?? "")
    })
    .map(n => {
      const d = n.data as { created_by?: string }
      const creator = adminUsers.find(u => String(u.id) === d?.created_by)
      return {
        id: n.id,
        title: n.title,
        body: n.body,
        created_at: n.created_at,
        username: creator?.username ?? "Admin",
      }
    })

  return NextResponse.json(serialize({
    stats: {
      totalFarms,
      totalUsers,
      totalProductionKg: totalProduction._sum.quantity ?? 0,
      totalProductionRecords: totalProduction._count,
      avgSatisfaction: totalProduction._avg.satisfaction ?? 0,
      activeSessions,
      activeTrays,
    },
    recentFarms: recentFarms.map(f => ({
      ...f,
      memberCount: f.farms_farmmodel_members.length,
      trayCount: f.farm_trays_farmtraymodel.length,
    })),
    recentProduction: recentProduction.map(row => ({
      date: row.created_at,
      kg: row._sum.quantity ?? 0,
      satisfaction: row._avg.satisfaction ?? 0,
    })),
    productionList,
    recentAnnouncements: filteredAnnouncements,
    usersByRole,
    recentTraySteps,
  }))
}