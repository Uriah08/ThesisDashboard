import prisma from "@/lib/prisma"
import { serialize } from "@/lib/serializer"
import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"

function getPeriodStart(period: string | null): Date | null {
  if (!period) return null
  const now = new Date()
  if (period === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (period === "month") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  if (period === "3months") return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  return null
}

export async function GET(request: Request) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period")
  const since = getPeriodStart(period)
  const dateFilter = since ? { gte: since } : undefined

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
      dateFilter ? { where: { create_at: dateFilter } } : undefined
    ),

    prisma.users_customuser.count(),

    prisma.production_farmproductionmodel.aggregate({
      where: dateFilter ? { created_at: dateFilter } : undefined,
      _sum: { quantity: true },
      _count: true,
      _avg: { satisfaction: true },
    }),

    prisma.farm_sessions_farmsessionmodel.count({
      where: {
        status: "active",
        ...(dateFilter ? { created_at: dateFilter } : {}),
      },
    }),

    prisma.farm_trays_farmtraymodel.count({
      where: {
        status: "active",
        ...(dateFilter ? { created_at: dateFilter } : {}),
      },
    }),

    prisma.farms_farmmodel.findMany({
      take: 6,
      orderBy: { create_at: "desc" },
      where: dateFilter ? { create_at: dateFilter } : undefined,
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
      where: dateFilter ? { created_at: dateFilter } : undefined,
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
      where: dateFilter ? { created_at: dateFilter } : undefined,
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