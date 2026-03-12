"use client"

import { SessionUser } from "@/lib/session"
import { useDashboardQuery } from "@/store/dashboardApi"
import { Fish, Users, Package, Layers, MapPin, RefreshCw } from "lucide-react"
import Sidebar from "@/components/container/Sidebar"

const SATISFACTION_EMOJIS = ["😞", "😐", "🙂", "😊", "😁"];

const StatCard = ({
  icon, label, value, sub
}: {
  icon: React.ReactNode, label: string, value: string | number, sub?: string
}) => (
  <div className="bg-white rounded-xl border border-zinc-100 p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{label}</p>
      <div className="w-8 h-8 rounded-lg bg-[#155183]/8 flex items-center justify-center text-[#155183]">
        {icon}
      </div>
    </div>
    <p className="text-3xl font-bold text-zinc-900 tracking-tight">{value}</p>
    {sub && <p className="text-xs text-zinc-400">{sub}</p>}
  </div>
)

export default function Dashboard({ user }: { user: SessionUser }) {
  const { data, isLoading, refetch, isFetching } = useDashboardQuery()

  return (
    <div className="min-h-screen bg-zinc-50 flex">

      {/* ── Sidebar ── */}
      <Sidebar user={user} />

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-56 p-6 md:p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Overview</p>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <Fish size={28} className="text-[#155183] animate-pulse" />
              <p className="text-sm text-zinc-400">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Fish size={15} />} label="Total Farms" value={data?.stats.totalFarms ?? 0} />
              <StatCard icon={<Users size={15} />} label="Total Users" value={data?.stats.totalUsers ?? 0} />
              <StatCard
                icon={<Package size={15} />}
                label="Production"
                value={`${Number(data?.stats.totalProductionKg ?? 0).toFixed(1)} kg`}
                sub={`${data?.stats.totalProductionRecords ?? 0} records`}
              />
              <StatCard
                icon={<Layers size={15} />}
                label="Active Trays"
                value={data?.stats.activeTrays ?? 0}
                sub={`${data?.stats.activeSessions ?? 0} active sessions`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

              {/* ── Recent Farms ── */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Recent Farms</p>
                  <span className="text-xs text-zinc-300">{data?.recentFarms?.length ?? 0} shown</span>
                </div>
                <div className="flex flex-col gap-3">
                  {data?.recentFarms?.map((farm: any) => (
                    <div key={farm.id} className="flex items-center gap-3 py-2 border-b border-zinc-50 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-[#155183]/8 flex items-center justify-center text-[#155183] shrink-0">
                        <Fish size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{farm.name}</p>
                        <p className="text-xs text-zinc-400">by {farm.users_customuser?.username}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 shrink-0">
                        <span className="flex items-center gap-1">
                          <Users size={10} /> {farm.memberCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers size={10} /> {farm.trayCount}
                        </span>
                        <span>{new Date(farm.create_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  ))}
                  {!data?.recentFarms?.length && (
                    <p className="text-sm text-zinc-300 text-center py-6">No farms yet</p>
                  )}
                </div>
              </div>

              {/* ── Users by role ── */}
              <div className="bg-white rounded-xl border border-zinc-100 p-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Users by Role</p>
                <div className="flex flex-col gap-3">
                  {data?.usersByRole?.map((r: any) => (
                    <div key={r.role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#155183]" />
                        <p className="text-sm text-zinc-700 capitalize">{r.role || "—"}</p>
                      </div>
                      <span className="text-sm font-semibold text-zinc-900">{r._count}</span>
                    </div>
                  ))}
                </div>

                {/* Avg satisfaction */}
                <div className="mt-6 pt-5 border-t border-zinc-50">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Avg Satisfaction</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {SATISFACTION_EMOJIS[Math.round(data?.stats.avgSatisfaction ?? 3) - 1]}
                    </span>
                    <div>
                      <p className="text-xl font-bold text-zinc-900">
                        {Number(data?.stats.avgSatisfaction ?? 0).toFixed(1)}
                        <span className="text-sm font-normal text-zinc-400"> / 5</span>
                      </p>
                      <p className="text-xs text-zinc-400">across all production</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ── Recent Production ── */}
              <div className="bg-white rounded-xl border border-zinc-100 p-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Recent Production</p>
                <div className="flex flex-col gap-3">
                  {data?.recentProduction?.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-zinc-50 last:border-0">
                      <span className="text-xl shrink-0">
                        {SATISFACTION_EMOJIS[(p.satisfaction ?? 3) - 1]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{p.title}</p>
                        <p className="text-xs text-zinc-400 flex items-center gap-1">
                          <Fish size={9} /> {p.farms_farmmodel?.name}
                          {p.landing && <><MapPin size={9} className="ml-1" />{p.landing}</>}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-[#155183]">{p.quantity} kg</p>
                        <p className="text-[10px] text-zinc-400">
                          {new Date(p.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!data?.recentProduction?.length && (
                    <p className="text-sm text-zinc-300 text-center py-6">No production records</p>
                  )}
                </div>
              </div>

              {/* ── Recent Announcements ── */}
              <div className="bg-white rounded-xl border border-zinc-100 p-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Announcements</p>
                <div className="flex flex-col gap-3">
                  {data?.recentAnnouncements?.map((a: any) => (
                    <div key={a.id} className="flex items-start gap-3 py-2 border-b border-zinc-50 last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        a.status === "active" ? "bg-green-400" : "bg-zinc-300"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{a.title}</p>
                        <p className="text-xs text-zinc-400">
                          {a.farms_farmmodel?.name} · by {a.users_customuser?.username}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        a.status === "active"
                          ? "bg-green-50 text-green-600"
                          : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                  {!data?.recentAnnouncements?.length && (
                    <p className="text-sm text-zinc-300 text-center py-6">No announcements</p>
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