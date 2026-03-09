import { SessionOptions, getIronSession } from "iron-session"
import { cookies } from "next/headers"

export type SessionUser = {
  id: string
  username: string
  email: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "fiscan_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
}

export async function getSession() {
  const session = await getIronSession<{ user?: SessionUser }>(
    await cookies(),
    sessionOptions
  )
  return session
}