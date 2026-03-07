import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const users = await prisma.users_customuser.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      first_name: true,
      last_name: true,
      profile_picture: true
    }
  })

  const serializedUsers = users.map((user) => ({
    ...user,
    id: Number(user.id)
  }))

  return NextResponse.json(serializedUsers)
}