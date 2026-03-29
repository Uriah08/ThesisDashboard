import prisma from "@/lib/prisma"
import { serialize } from "@/lib/serializer"
import { getSession } from "@/lib/session"
import { NextRequest, NextResponse } from "next/server"

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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, password, confirmPassword, owner_id } = body

    // ── Validation ──────────────────────────────────────────────
    const errors: Record<string, string> = {}
    if (!name?.trim()) errors.name = "Farm name is required"
    if (!password?.trim()) errors.password = "Password is required"
    if (!confirmPassword?.trim()) errors.confirmPassword = "Please confirm your password"
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match"
    if (!owner_id) errors.owner_id = "Please select an owner"
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 })
    }

    // ── Create farm ─────────────────────────────────────────────
    const farm = await prisma.farms_farmmodel.create({
      data: {
        name: name.trim(),
        description: description?.trim() ?? null,
        owner_id: BigInt(owner_id),
        create_at: new Date(),
        password: password.trim(),
      },
      select: {
        id: true,
        name: true,
        description: true,
        create_at: true,
      },
    })

    return NextResponse.json({
      ...farm,
      id: Number(farm.id)
    }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/farms]", err)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}