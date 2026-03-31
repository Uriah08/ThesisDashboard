import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendPushNotification } from "@/lib/push"

type ForecastItem = {
  dt_txt:  string
  main:    { temp: number }
  weather: [{ description: string }]
  clouds:  { all: number }
  pop:     number
}

const API_KEY = process.env.OPENWEATHERMAP_API_KEY
const LAT     = "14.315581"
const LON     = "120.742818"

function toPhilippineTime(dtTxt: string): Date {
  const utc = new Date(dtTxt.replace(" ", "T") + "Z")
  return new Date(utc.toLocaleString("en-US", { timeZone: "Asia/Manila" }))
}

function mostCommon(arr: string[]): string {
  const freq: Record<string, number> = {}
  for (const v of arr) freq[v] = (freq[v] ?? 0) + 1
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
}

function rainDesc(r: number): string {
  if (r === 0) return "no expected rain"
  if (r < 30)  return `a slight ${r.toFixed(0)}% chance of rain`
  if (r < 60)  return `a moderate ${r.toFixed(0)}% chance of rain`
  if (r < 80)  return `a high ${r.toFixed(0)}% chance of rain`
  return             `a very high ${r.toFixed(0)}% chance of rain`
}

function cloudDesc(c: number): string {
  if (c < 30) return "mostly clear skies"
  if (c < 60) return "partly cloudy skies"
  if (c < 85) return "noticeable cloud cover"
  return           "overcast skies"
}

const ALERT_RANK: Record<string, number> = {
  Excellent: 0,
  Good:      1,
  Caution:   2,
  Warning:   3,
  Danger:    4,
}

export async function GET(request: Request) {
//   const authHeader = request.headers.get("authorization")
//   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`
    )
    if (!res.ok) throw new Error(`OpenWeather error: ${res.status}`)

    const data         = await res.json()
    const forecastList = data?.list ?? []
    const city: string = data?.city?.name ?? "Naic"

    if (!forecastList.length) return NextResponse.json({ message: "No forecast data." })

    const nowPHT = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }))

    const targetDays = [1, 2].map(offset => {
      const d = new Date(nowPHT)
      d.setDate(d.getDate() + offset)
      return d.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" })
    })

    let fullBody     = ""
    let highestAlert = "Excellent"

    for (const targetDate of targetDays) {
      const dayEntries = forecastList.filter((item: ForecastItem) => {
        const ph = toPhilippineTime(item.dt_txt)
        return ph.toLocaleDateString("en-CA") === targetDate
      })

      if (!dayEntries.length) continue

      const targetEntry = (dayEntries as ForecastItem[]).reduce((closest, item) => {
        const ph      = toPhilippineTime(item.dt_txt)
        const phClose = toPhilippineTime(closest.dt_txt)
        return Math.abs(ph.getHours() - 12) < Math.abs(phClose.getHours() - 12) ? item : closest
        })

        const temps        = (dayEntries as ForecastItem[]).map(e => e.main.temp)
        const descriptions = (dayEntries as ForecastItem[]).map(e => e.weather[0].description)

      const maxTemp    = Math.max(...temps)
      const minTemp    = Math.min(...temps)
      const commonDesc = mostCommon(descriptions)
        .split(" ").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" ")

      const rainPercent = (targetEntry.pop ?? 0) * 100
      const cloud       = targetEntry.clouds?.all ?? 0
      const rainText    = rainDesc(rainPercent)
      const cloudText   = cloudDesc(cloud)

      let alert   = "Excellent"
      let message = ""

      if (rainPercent === 0 && cloud < 50) {
        alert   = "Excellent"
        message = `Ideal conditions for drying fish: ${cloudText}, and ${rainText}.`
      } else if (rainPercent === 0) {
        alert   = "Good"
        message = `Good weather for drying fish with ${cloudText}, and ${rainText}.`
      } else if (rainPercent <= 80) {
        alert   = "Caution"
        message = `Be cautious: ${cloudText}, and ${rainText}. Drying may be slow or risky.`
      } else if (rainPercent < 99) {
        alert   = "Warning"
        message = `Drying fish is not recommended due to ${cloudText}, and ${rainText}.`
      } else {
        alert   = "Danger"
        message = `Avoid drying fish. Extreme conditions: ${cloudText}, and ${rainText}.`
      }

      if (ALERT_RANK[alert] > ALERT_RANK[highestAlert]) highestAlert = alert

      const dateLabel = new Date(targetDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })

      fullBody +=
        `${dateLabel}\n` +
        `${commonDesc}. High ${maxTemp.toFixed(1)}°C / Low ${minTemp.toFixed(1)}°C\n` +
        `Chance of rain up to ${rainPercent.toFixed(0)}%\n` +
        `Fish Drying Alert: ${alert}\n${message}\n\n`
    }

    if (!fullBody) return NextResponse.json({ message: "No forecast data built." })

    const [startDate, endDate] = targetDays.map(d =>
      new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    )

    const [startMonth] = startDate.split(" ")
    const [endMonth]   = endDate.split(" ")

    const titleDate = startMonth === endMonth
      ? `${startDate.replace(/,.*/, "")}–${endDate.replace(/^\w+ /, "")}`
      : `${startDate} – ${endDate}`

    const title = `Drying Conditions Expected Tomorrow — ${city}, ${titleDate}`

    // ── save notification + recipients ───────────────────────────────────────
    const users = await prisma.users_customuser.findMany({ select: { id: true } })

    const now = new Date()

    const notification = await prisma.notifications_notification.create({
      data: {
        title,
        body:       fullBody.trim(),
        type:       "weather",
        data:       { city, dates: targetDays, alert: highestAlert },
        created_at: now,
        updated_at: now,
      },
    })

    await prisma.notifications_recipient.createMany({
      data: users.map(u => ({
        notification_id: notification.id,
        user_id:         u.id,
        read:            false,
        created_at:      now,
      })),
    })

    // ── push notifications ────────────────────────────────────────────────────
    const tokens = await prisma.notifications_devicetoken.findMany({
      where:  { user_id: { in: users.map(u => u.id) } },
      select: { token: true },
    })

    await Promise.allSettled(
      tokens.map(({ token }) =>
        sendPushNotification(token, title, fullBody.trim())
      )
    )

    console.log("Weather notification sent successfully.")
    return NextResponse.json({ success: true, alert: highestAlert })

  } catch (err) {
    console.error("Weather cron error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}