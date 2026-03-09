import prisma from "@/lib/prisma"
import { serialize } from "@/lib/serializer"
import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

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

    // Total farms
    prisma.farms_farmmodel.count(),

    // Total users
    prisma.users_customuser.count(),

    // Total production quantity
    prisma.production_farmproductionmodel.aggregate({
      _sum: { quantity: true },
      _count: true,
      _avg: { satisfaction: true },
    }),

    // Active farm sessions
    prisma.farm_sessions_farmsessionmodel.count({
      where: { status: "active" },
    }),

    // Active trays
    prisma.farm_trays_farmtraymodel.count({
      where: { status: "active" },
    }),

    // Recent farms with owner + member count
    prisma.farms_farmmodel.findMany({
      take: 6,
      orderBy: { create_at: "desc" },
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

    // Recent production records
    prisma.production_farmproductionmodel.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
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

    // Recent announcements
    prisma.announcements_announcementmodel.findMany({
      take: 4,
      orderBy: { created_at: "desc" },
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

    // Users grouped by role
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