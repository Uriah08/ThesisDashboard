import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const {
    farm_id,
    title,
    notes,
    quantity,
    total,
    landing,
    satisfaction,
    created_at,
  } = body

  // Validate required fields
  if (!farm_id || !title || quantity == null || total == null || !satisfaction) {
    return NextResponse.json(
      {
        message: "Validation error",
        errors: {
          ...(!farm_id    && { farm_id:      "Required" }),
          ...(!title      && { title:        "Required" }),
          ...(quantity == null && { quantity: "Required" }),
          ...(total == null    && { total:    "Required" }),
          ...(!satisfaction   && { satisfaction: "Required" }),
        },
      },
      { status: 400 }
    )
  }

  if (typeof quantity !== "number" || quantity <= 0) {
    return NextResponse.json(
      { message: "Validation error", errors: { quantity: "Must be a positive number" } },
      { status: 400 }
    )
  }

  if (typeof total !== "number" || total < 0) {
    return NextResponse.json(
      { message: "Validation error", errors: { total: "Must be a valid amount" } },
      { status: 400 }
    )
  }

  if (satisfaction < 1 || satisfaction > 5) {
    return NextResponse.json(
      { message: "Validation error", errors: { satisfaction: "Must be between 1 and 5" } },
      { status: 400 }
    )
  }

  // Check farm exists
  const farm = await prisma.farms_farmmodel.findUnique({
    where: { id: BigInt(farm_id) },
  })

  if (!farm) {
    return NextResponse.json(
      { message: "Validation error", errors: { farm_id: "Farm not found" } },
      { status: 404 }
    )
  }

  const production = await prisma.production_farmproductionmodel.create({
    data: {
      farm_id:      BigInt(farm_id),
      title,
      notes:        notes ?? null,
      quantity,
      total,
      landing:      landing ?? null,
      satisfaction,
      created_at:   created_at ? new Date(created_at) : new Date(),
    },
  })

  return NextResponse.json(
    { message: "Production record created", data: { id: production.id.toString() } },
    { status: 201 }
  )
}