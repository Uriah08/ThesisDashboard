import prisma from "@/lib/prisma"
import { serialize } from "@/lib/serializer"
import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { id: rawId } = await params
  const id = BigInt(rawId)

  const farm = await prisma.farms_farmmodel.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      image_url: true,
      create_at: true,

      // Owner
      users_customuser: {
        select: { id: true, username: true, email: true, profile_picture: true, role: true },
      },

      // Members
      farms_farmmodel_members: {
        select: {
          users_customuser: {
            select: { id: true, username: true, email: true, profile_picture: true, role: true },
          },
        },
      },

      // Trays
      farm_trays_farmtraymodel: {
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          created_at: true,
        },
      },

      // Sessions
      farm_sessions_farmsessionmodel: {
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          start_time: true,
          end_time: true,
          created_at: true,
        },
      },

      // Production
      production_farmproductionmodel: {
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          title: true,
          notes: true,
          satisfaction: true,
          quantity: true,
          landing: true,
          created_at: true,
        },
      },

      // Announcements
      announcements_announcementmodel: {
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          title: true,
          content: true,
          status: true,
          created_at: true,
          expires_at: true,
          users_customuser: { select: { username: true } },
        },
      },
    },
  })

  if (!farm) return NextResponse.json({ message: "Farm not found" }, { status: 404 })

  const production = farm.production_farmproductionmodel
  const totalProductionKg = production.reduce((sum, p) => sum + p.quantity, 0)
  const avgSatisfaction =
    production.length > 0
      ? production.reduce((sum, p) => sum + p.satisfaction, 0) / production.length
      : 0

  return NextResponse.json(
    serialize({
      ...farm,
      members: farm.farms_farmmodel_members.map(m => m.users_customuser),
      memberCount: farm.farms_farmmodel_members.length,
      trayCount: farm.farm_trays_farmtraymodel.length,
      activeTrayCount: farm.farm_trays_farmtraymodel.filter(t => t.status === "active").length,
      sessionCount: farm.farm_sessions_farmsessionmodel.length,
      activeSessionCount: farm.farm_sessions_farmsessionmodel.filter(s => s.status === "active").length,
      productionCount: production.length,
      totalProductionKg,
      avgSatisfaction,
      activeAnnouncementCount: farm.announcements_announcementmodel.filter(a => a.status === "active").length,
      trays: farm.farm_trays_farmtraymodel,
      sessions: farm.farm_sessions_farmsessionmodel,
      production: farm.production_farmproductionmodel,
      announcements: farm.announcements_announcementmodel,
    })
  )
}