import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
    const [farms, productions, logs] = await Promise.all([
        prisma.farms_farmmodel.count(),

        prisma.production_farmproductionmodel.findMany({
            select: {
                total: true,
            }
        }),

        prisma.trays_sessiontraymodel.count()
    ])

    const totalProduction = productions.reduce((sum, p) => sum + p.total, 0)

    return NextResponse.json({
        farms,
        totalProduction,
        logs
    })
}