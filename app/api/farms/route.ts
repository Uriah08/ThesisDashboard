import prisma from "@/lib/prisma"
import { serialize } from "@/lib/serializer"
import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const farms = await prisma.farms_farmmodel.findMany({
    orderBy: { create_at: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      image_url: true,
      create_at: true,
      users_customuser: {
        select: { id: true, username: true, email: true, profile_picture: true },
      },
      farms_farmmodel_members: { select: { id: true } },
      farm_trays_farmtraymodel: { select: { id: true, status: true } },
      farm_sessions_farmsessionmodel: { select: { id: true, status: true } },
      production_farmproductionmodel: {
        select: { id: true, quantity: true, satisfaction: true },
      },
      announcements_announcementmodel: {
        select: { id: true, status: true },
      },
    },
  })

  return NextResponse.json(
    serialize(
      farms.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        image_url: f.image_url,
        create_at: f.create_at,
        users_customuser: f.users_customuser,
        memberCount: f.farms_farmmodel_members.length,
        trayCount: f.farm_trays_farmtraymodel.length,
        activeTrayCount: f.farm_trays_farmtraymodel.filter(t => t.status === "active").length,
        sessionCount: f.farm_sessions_farmsessionmodel.length,
        activeSessionCount: f.farm_sessions_farmsessionmodel.filter(s => s.status === "active").length,
        productionCount: f.production_farmproductionmodel.length,
        totalProductionKg: f.production_farmproductionmodel.reduce((sum, p) => sum + p.quantity, 0),
        avgSatisfaction:
          f.production_farmproductionmodel.length > 0
            ? f.production_farmproductionmodel.reduce((sum, p) => sum + p.satisfaction, 0) /
              f.production_farmproductionmodel.length
            : 0,
        activeAnnouncementCount: f.announcements_announcementmodel.filter(a => a.status === "active").length,
      }))
    )
  )
}