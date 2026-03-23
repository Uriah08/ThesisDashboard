"use client"

import { SessionUser } from "@/lib/session"
import { useDashboardQuery } from "@/store/dashboardApi"
import { Fish, Users, Package, Layers, MapPin, RefreshCw } from "lucide-react"
import Sidebar from "@/components/container/Sidebar"
import { AnnouncementsAnnouncementModel, FarmsFarmModel, ProductionFarmProductionModel, UsersCustomUser } from "@/lib/types"
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import { useState } from "react"

const SATISFACTION_EMOJIS = ["😞", "😐", "🙂", "😊", "😁"]

const StatCard = ({
  icon, label, value, sub
}: {
  icon: React.ReactNode, label: string, value: string | number, sub?: string
}) => (
  <div style={{
    background: "#155183",
    borderRadius: 14,
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    color: "#fff",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7, margin: 0 }}>
        {label}
      </p>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: "rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {icon}
      </div>
    </div>
    <p style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ fontSize: 11, opacity: 0.6, margin: 0 }}>{sub}</p>}
  </div>
)

type Period = "week" | "month" | "3months" | null

export default function Dashboard({ user }: { user: SessionUser }) {
  
  const [period, setPeriod] = useState<Period>(null)
  const { data, isLoading, refetch, isFetching } = useDashboardQuery(period)

  const productionChartData = data?.recentProduction
    ?.slice()
    .reverse()
    .map((p: ProductionFarmProductionModel) => ({
      name: p.title.length > 10 ? p.title.slice(0, 10) + "…" : p.title,
      kg: p.quantity,
      satisfaction: p.satisfaction ?? 0,
    })) ?? []

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex" }}>

      {/* ── Sidebar ── */}
      <Sidebar user={user} />

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-56 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8">

        {/* Header */}
        <div className="mt-5" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", opacity: 0.6, margin: "0 0 4px" }}>
              Overview
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d2e47", margin: 0, letterSpacing: "-0.02em" }}>
              Dashboard
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Period filter buttons */}
            {([
              { label: "All time", value: null },
              { label: "Week",     value: "week" },
              { label: "Month",    value: "month" },
              { label: "3 Months", value: "3months" },
            ] as { label: string; value: Period }[]).map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => setPeriod(opt.value)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #155183",
                  cursor: "pointer",
                  transition: "all .15s",
                  background: period === opt.value ? "#155183" : "#fff",
                  color:      period === opt.value ? "#fff"    : "#155183",
                }}
              >
                {opt.label}
              </button>
            ))}

            {/* Refresh button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "#155183",
                background: "#fff", border: "1.5px solid #155183",
                borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                fontWeight: 500, opacity: isFetching ? 0.6 : 1, transition: "opacity .2s"
              }}
            >
              <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Fish size={28} color="#155183" className="animate-pulse" />
              <p style={{ fontSize: 13, color: "#155183", opacity: 0.5, margin: 0 }}>Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <StatCard icon={<Fish size={14} color="#fff" />} label="Total Farms" value={data?.stats.totalFarms ?? 0} />
              <StatCard icon={<Users size={14} color="#fff" />} label="Total Users" value={data?.stats.totalUsers ?? 0} />
              <StatCard
                icon={<Package size={14} color="#fff" />}
                label="Production"
                value={`${Number(data?.stats.totalProductionKg ?? 0).toFixed(1)} kg`}
                sub={`${data?.stats.totalProductionRecords ?? 0} records`}
              />
              <StatCard
                icon={<Layers size={14} color="#fff" />}
                label="Active Trays"
                value={data?.stats.activeTrays ?? 0}
                sub={`${data?.stats.activeSessions ?? 0} active sessions`}
              />
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* Bar Chart — Production Quantity */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1.5px solid #e2eaf2" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 4px" }}>
                  Production Quantity
                </p>
                <p style={{ fontSize: 11, color: "#9ab0c4", margin: "0 0 16px" }}>kg per record (oldest → newest)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={productionChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2eaf2" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ab0c4" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ab0c4" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1.5px solid #e2eaf2", fontSize: 12 }}
                    />
                    <Bar dataKey="kg" fill="#155183" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart — Satisfaction Trend */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1.5px solid #e2eaf2" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 4px" }}>
                  Satisfaction Trend
                </p>
                <p style={{ fontSize: 11, color: "#9ab0c4", margin: "0 0 16px" }}>score per record (1–5, oldest → newest)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={productionChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2eaf2" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ab0c4" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: "#9ab0c4" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1.5px solid #e2eaf2", fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#155183"
                      strokeWidth={2}
                      dot={{ fill: "#155183", r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* ── Farms + Roles ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

              {/* Recent Farms */}
              <div className="lg:col-span-2" style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1.5px solid #e2eaf2" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: 0 }}>
                    Recent Farms
                  </p>
                  <span style={{ fontSize: 11, color: "#9ab0c4" }}>{data?.recentFarms?.length ?? 0} shown</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {data?.recentFarms?.map((farm: FarmsFarmModel) => (
                    <div key={farm.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 0", borderBottom: "1px solid #f0f4f8"
                    }} className="last:border-0">
                      <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: "#e8f0f8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, color: "#155183"
                      }}>
                        <Fish size={14} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0d2e47", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {farm.name}
                        </p>
                        <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0 }}>by {farm.users_customuser?.username}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2" style={{ fontSize: 11, color: "#9ab0c4", flexShrink: 0 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Users size={10} /> {farm.memberCount}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Layers size={10} /> {farm.trayCount}
                        </span>
                        <span style={{
                          background: "#e8f0f8", color: "#155183",
                          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20
                        }}>
                          {new Date(farm.create_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!data?.recentFarms?.length && (
                    <p style={{ fontSize: 13, color: "#c5d5e4", textAlign: "center", padding: "24px 0", margin: 0 }}>No farms yet</p>
                  )}
                </div>
              </div>

              {/* Users by role */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1.5px solid #e2eaf2" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 16px" }}>
                  Users by Role
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data?.usersByRole?.map((r: UsersCustomUser) => (
                    <div key={r.role} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#155183" }} />
                        <p style={{ fontSize: 13, color: "#0d2e47", margin: 0, textTransform: "capitalize" }}>{r.role || "—"}</p>
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: "#155183",
                        background: "#e8f0f8", padding: "2px 10px", borderRadius: 20
                      }}>
                        {r._count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Avg satisfaction */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1.5px solid #f0f4f8" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 12px" }}>
                    Avg Satisfaction
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 32 }}>
                      {SATISFACTION_EMOJIS[Math.round(data?.stats.avgSatisfaction ?? 3) - 1]}
                    </span>
                    <div>
                      <p style={{ fontSize: 22, fontWeight: 700, color: "#0d2e47", margin: 0, letterSpacing: "-0.02em" }}>
                        {Number(data?.stats.avgSatisfaction ?? 0).toFixed(1)}
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#9ab0c4" }}> / 5</span>
                      </p>
                      <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0 }}>across all production</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Production + Announcements ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Recent Production */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1.5px solid #e2eaf2" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 16px" }}>
                  Recent Production
                </p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {data?.recentProduction?.map((p: ProductionFarmProductionModel) => (
                    <div key={p.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 0", borderBottom: "1px solid #f0f4f8"
                    }} className="last:border-0">
                      <span style={{ fontSize: 22, flexShrink: 0 }}>
                        {SATISFACTION_EMOJIS[(p.satisfaction ?? 3) - 1]}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0d2e47", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </p>
                        <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                          <Fish size={9} /> {p.farms_farmmodel?.name}
                          {p.landing && <><MapPin size={9} style={{ marginLeft: 4 }} />{p.landing}</>}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#155183", margin: 0 }}>{p.quantity} kg</p>
                        <p style={{ fontSize: 10, color: "#9ab0c4", margin: 0 }}>
                          {new Date(p.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!data?.recentProduction?.length && (
                    <p style={{ fontSize: 13, color: "#c5d5e4", textAlign: "center", padding: "24px 0", margin: 0 }}>No production records</p>
                  )}
                </div>
              </div>

              {/* Recent Announcements */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1.5px solid #e2eaf2" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 16px" }}>
                  Announcements
                </p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {data?.recentAnnouncements?.map((a: AnnouncementsAnnouncementModel) => (
                    <div key={a.id} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 0", borderBottom: "1px solid #f0f4f8"
                    }} className="last:border-0">
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                        background: a.status === "active" ? "#22c55e" : "#c5d5e4"
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0d2e47", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {a.title}
                        </p>
                        <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0 }}>
                          {a.farms_farmmodel?.name} · by {a.users_customuser?.username}
                        </p>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        padding: "3px 9px", borderRadius: 20, flexShrink: 0, marginTop: 1,
                        background: a.status === "active" ? "#dcfce7" : "#f0f4f8",
                        color: a.status === "active" ? "#15803d" : "#9ab0c4"
                      }}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                  {!data?.recentAnnouncements?.length && (
                    <p style={{ fontSize: 13, color: "#c5d5e4", textAlign: "center", padding: "24px 0", margin: 0 }}>No announcements</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}