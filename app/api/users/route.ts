import prisma from "@/lib/prisma"
import { hashDjangoPassword } from "@/lib/verifyDjangoPassword"
import { NextRequest, NextResponse } from "next/server"

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
 
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      role,
      mobile_number,
      birthday,
      address,
    } = body
 
    // ── Validate ─────────────────────────────────────────────────────────────
    const errors: Record<string, string> = {}
    if (!first_name?.trim())      errors.first_name    = "Required"
    if (!last_name?.trim())       errors.last_name     = "Required"
    if (!username?.trim())        errors.username      = "Required"
    if (!email?.trim())           errors.email         = "Required"
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email"
    if (!password)                errors.password      = "Required"
    else if (password.length < 8) errors.password      = "Min 8 characters"
    if (!role)                    errors.role          = "Required"
    if (!mobile_number?.trim())   errors.mobile_number = "Required"
    if (!address?.trim())         errors.address       = "Required"
 
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 })
    }
 
    // ── Uniqueness check ──────────────────────────────────────────────────────
    const [existingEmail, existingUsername] = await Promise.all([
      prisma.users_customuser.findUnique({ where: { email } }),
      prisma.users_customuser.findUnique({ where: { username } }),
    ])
 
    if (existingEmail) {
      return NextResponse.json(
        { errors: { email: "Email is already in use" } },
        { status: 409 }
      )
    }
    if (existingUsername) {
      return NextResponse.json(
        { errors: { username: "Username is already taken" } },
        { status: 409 }
      )
    }
 
    // ── Hash password (Django-compatible PBKDF2) ──────────────────────────────
    const hashed = await hashDjangoPassword(password)
 
    // ── Create user ───────────────────────────────────────────────────────────
    const user = await prisma.users_customuser.create({
      data: {
        first_name:    first_name.trim(),
        last_name:     last_name.trim(),
        username:      username.trim().toLowerCase(),
        email:         email.trim().toLowerCase(),
        password:      hashed,
        role,
        mobile_number: mobile_number.trim(),
        address:       address.trim(),
        birthday:      birthday ? new Date(birthday) : null,
        is_active:     true,
        is_staff:      false,
        is_superuser:  false,
        is_complete:   false,
        date_joined:   new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
      },
    })
 
    return NextResponse.json(
      { ...user, id: Number(user.id) },
      { status: 201 }
    )
  } catch (err) {
    console.error("[POST /api/users]", err)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}