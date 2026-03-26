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
  let createAtFilter:  { gte?: Date; lte?: Date } | undefined = undefined

  if (from && to) {
    const fromDate = new Date(decodeURIComponent(from))
    const toDate   = new Date(decodeURIComponent(to))
    toDate.setHours(23, 59, 59, 999)
    createdAtFilter = { gte: fromDate, lte: toDate }
    createAtFilter  = { gte: fromDate, lte: toDate }
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
  ] = await Promise.all([

    prisma.farms_farmmodel.count(
      createAtFilter ? { where: { create_at: createAtFilter } } : undefined
    ),

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
      take: 6,
      orderBy: { create_at: "desc" },
      where: createAtFilter ? { create_at: createAtFilter } : undefined,
      select: {
        id: true,
        name: true,
        create_at: true,
        image_url: true,
        users_customuser: {
          select: { username: true, email: true, profile_picture: true }
        },
        farms_farmmodel_members: { select: { id: true } },
        farm_trays_farmtraymodel: { select: { id: true } },
      }
    }),

    prisma.production_farmproductionmodel.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      where: createdAtFilter ? { created_at: createdAtFilter } : undefined,
      select: {
        id: true,
        title: true,
        quantity: true,
        satisfaction: true,
        landing: true,
        created_at: true,
        farms_farmmodel: { select: { name: true } }
      }
    }),

    prisma.announcements_announcementmodel.findMany({
      take: 4,
      orderBy: { created_at: "desc" },
      where: createdAtFilter ? { created_at: createdAtFilter } : undefined,
      select: {
        id: true,
        title: true,
        status: true,
        created_at: true,
        expires_at: true,
        users_customuser: { select: { username: true } },
        farms_farmmodel: { select: { name: true } },
      }
    }),

    prisma.users_customuser.groupBy({
      by: ["role"],
      _count: true,
    }),
  ])

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
    recentProduction,
    recentAnnouncements,
    usersByRole,
  }))
}