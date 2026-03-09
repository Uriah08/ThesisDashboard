import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { SessionUser, sessionOptions } from "@/lib/session"

const PROTECTED = ["/dashboard"]
const AUTH_ROUTES = ["/auth/sign-in"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // ✅ correct way to pass cookies in middleware
  const session = await getIronSession<{ user?: SessionUser }>(
    req,
    res,
    sessionOptions
  )

  const isLoggedIn = !!session.user
  const path = req.nextUrl.pathname

  if (isLoggedIn && AUTH_ROUTES.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (!isLoggedIn && PROTECTED.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url))
  }

  return res
}

export const config = {
  matcher: ["/:path*", "/auth/:path*"],
}