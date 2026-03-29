import prisma from "@/lib/prisma"
import { serialize } from "@/lib/serializer"
import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { id: rawId } = await params
  const id = BigInt(rawId)

  // ── Parse optional date range from query params ────────────────────────────
  const { searchParams } = new URL(req.url)
  const fromParam = searchParams.get("from")
  const toParam   = searchParams.get("to")

  const dateFilter =
    fromParam && toParam
      ? { gte: new Date(fromParam), lte: new Date(toParam) }
      : undefined

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

      // Members (no date filter — membership isn't time-scoped)
      farms_farmmodel_members: {
        select: {
          users_customuser: {
            select: { id: true, username: true, email: true, profile_picture: true, role: true },
          },
        },
      },

      // Trays — filtered, include session trays so we can reach tray steps
      farm_trays_farmtraymodel: {
        where: dateFilter ? { created_at: dateFilter } : undefined,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          created_at: true,
          trays_sessiontraymodel: {
            select: { id: true },
          },
        },
      },

      // Sessions — filtered
      farm_sessions_farmsessionmodel: {
        where: dateFilter ? { created_at: dateFilter } : undefined,
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

      // Production — filtered
      production_farmproductionmodel: {
        where: dateFilter ? { created_at: dateFilter } : undefined,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          title: true,
          notes: true,
          satisfaction: true,
          total: true,
          quantity: true,
          landing: true,
          created_at: true,
        },
      },

      // Announcements — filtered
      announcements_announcementmodel: {
        where: dateFilter ? { created_at: dateFilter } : undefined,
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

  // ── Fetch tray steps via session tray IDs (farm → tray → sessiontray → step)
  const sessionTrayIds = farm.farm_trays_farmtraymodel
    .flatMap(t => t.trays_sessiontraymodel)
    .map(s => s.id)

  const traySteps = sessionTrayIds.length > 0
    ? await prisma.trays_traystepmodel.findMany({
        where: {
          tray_id: { in: sessionTrayIds },
          ...(dateFilter ? { datetime: dateFilter } : {}),
        },
        select: {
          id: true,
          title: true,
          datetime: true,
          detected: true,
          rejects: true,
        },
      })
    : []

  // ── Derived stats ──────────────────────────────────────────────────────────
  const production    = farm.production_farmproductionmodel
  const totalProductionKg = production.reduce((sum, p) => sum + p.quantity, 0)
  const avgSatisfaction   =
    production.length > 0
      ? production.reduce((sum, p) => sum + p.satisfaction, 0) / production.length
      : 0
  
  const totalSales = production.reduce((sum, p) => sum + p.total, 0)

  return NextResponse.json(
    serialize({
      ...farm,
      members:            farm.farms_farmmodel_members.map(m => m.users_customuser),
      memberCount:        farm.farms_farmmodel_members.length,
      trayCount:          farm.farm_trays_farmtraymodel.length,
      activeTrayCount:    farm.farm_trays_farmtraymodel.filter(t => t.status === "active").length,
      sessionCount:       farm.farm_sessions_farmsessionmodel.length,
      activeSessionCount: farm.farm_sessions_farmsessionmodel.filter(s => s.status === "active").length,
      productionCount:    production.length,
      totalProductionKg,
      totalSales,
      avgSatisfaction,
      activeAnnouncementCount: farm.announcements_announcementmodel.filter(a => a.status === "active").length,
      trays:         farm.farm_trays_farmtraymodel,
      sessions:      farm.farm_sessions_farmsessionmodel,
      production:    farm.production_farmproductionmodel,
      announcements: farm.announcements_announcementmodel,
      traySteps,
    })
  )
}