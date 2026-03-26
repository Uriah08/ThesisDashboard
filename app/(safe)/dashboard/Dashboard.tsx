"use client"

import { SessionUser } from "@/lib/session"
import { Fish, Users, Package, Layers, MapPin, RefreshCw, CalendarIcon, X } from "lucide-react"
import Sidebar from "@/components/container/Sidebar"
import { AnnouncementsAnnouncementModel, FarmsFarmModel, ProductionFarmProductionModel, UsersCustomUser } from "@/lib/types"
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import { useState, useRef, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { useDashboardQuery } from "@/store/dashboardApi"

const SATISFACTION_EMOJIS = ["😞", "😐", "🙂", "😊", "😁"]

const StatCard = ({
  icon, label, value, sub
}: {
  icon: React.ReactNode, label: string, value: string | number, sub?: string
}) => (
  <div className="bg-[#155183] rounded-2xl p-5 flex flex-col gap-2.5 text-white">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-semibold tracking-widest uppercase opacity-70 m-0">{label}</p>
      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <p className="text-3xl font-bold tracking-tight leading-none m-0">{value}</p>
    {sub && <p className="text-[11px] opacity-60 m-0">{sub}</p>}
  </div>
)

export default function Dashboard({ user }: { user: SessionUser }) {
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>(undefined)
  const [appliedRange, setAppliedRange] = useState<DateRange | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const fromISO = appliedRange?.from ? appliedRange.from.toISOString() : null
  const toISO   = appliedRange?.to   ? appliedRange.to.toISOString()   : null

  const { data, isLoading, refetch, isFetching } = useDashboardQuery(fromISO, toISO)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
        setPendingRange(appliedRange)
      }
    }
    if (calendarOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [calendarOpen, appliedRange])

  const handleApply = () => {
    setAppliedRange(pendingRange)
    setCalendarOpen(false)
  }

  const handleClear = () => {
    setPendingRange(undefined)
    setAppliedRange(undefined)
    setCalendarOpen(false)
  }

  const hasApplied = appliedRange?.from && appliedRange?.to
  const hasPending = pendingRange?.from && pendingRange?.to

  const productionChartData = data?.recentProduction
    ?.slice()
    .reverse()
    .map((p: ProductionFarmProductionModel) => ({
      name: p.title.length > 10 ? p.title.slice(0, 10) + "…" : p.title,
      kg: p.quantity,
      satisfaction: p.satisfaction ?? 0,
    })) ?? []

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex overflow-x-hidden">
      <Sidebar user={user} />

      <main className="flex-1 lg:ml-56 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8">

        {/* Header */}
        <div className="mt-5 flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] opacity-60 mb-1">Overview</p>
            <h1 className="text-[22px] font-bold text-[#0d2e47] tracking-tight">Dashboard</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">

            {/* Date range picker */}
            <div ref={calendarRef} className="relative">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setPendingRange(appliedRange)
                    setCalendarOpen(prev => !prev)
                  }}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.75 border-[1.5px] border-[#155183] cursor-pointer transition-all whitespace-nowrap
                    ${hasApplied
                      ? "bg-[#155183] text-white rounded-l-lg rounded-r-none border-r-0"
                      : "bg-white text-[#155183] rounded-lg"
                    }`}
                >
                  <CalendarIcon size={13} />
                  {hasApplied
                    ? `${format(appliedRange!.from!, "MMM d, yyyy")} – ${format(appliedRange!.to!, "MMM d, yyyy")}`
                    : "All time"
                  }
                </button>

                {hasApplied && (
                  <button
                    onClick={handleClear}
                    className="flex items-center justify-center px-2.5 py-1.75 rounded-r-lg border-[1.5px] border-[#155183] border-l-white/30 bg-[#155183] text-white cursor-pointer hover:bg-[#0d3d63] transition-colors"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>

              {/* Calendar dropdown */}
              {calendarOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 z-50 bg-white rounded-2xl border-[1.5px] border-[#e2eaf2] shadow-[0_8px_32px_rgba(21,81,131,0.13)] overflow-hidden min-w-fit">

                  {/* Dropdown header */}
                  <div className="px-4 py-3 border-b border-[#f0f4f8] flex items-center justify-between">
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] m-0">
                      Filter by date range
                    </p>
                    {pendingRange?.from && (
                      <p className="text-[11px] text-[#9ab0c4] m-0">
                        {pendingRange.to
                          ? `${format(pendingRange.from, "MMM d")} – ${format(pendingRange.to, "MMM d, yyyy")}`
                          : `From ${format(pendingRange.from, "MMM d, yyyy")} — pick end date`
                        }
                      </p>
                    )}
                  </div>

                  {/* Calendar with brand color overrides */}
                  <style>{`
                    .rdp-dashboard [aria-selected="true"],
                    .rdp-dashboard .rdp-day_range_start,
                    .rdp-dashboard .rdp-day_range_end {
                      background-color: #155183 !important;
                      color: #fff !important;
                      border-radius: 6px !important;
                    }
                    .rdp-dashboard .rdp-day_range_middle {
                      background-color: #e8f0f8 !important;
                      color: #155183 !important;
                      border-radius: 0 !important;
                    }
                    .rdp-dashboard button:hover:not([aria-selected="true"]):not(:disabled) {
                      background-color: #f0f4f8 !important;
                      color: #155183 !important;
                    }
                  `}</style>
                  <div className="rdp-dashboard">
                    <Calendar
                      mode="range"
                      defaultMonth={pendingRange?.from ?? new Date()}
                      selected={pendingRange}
                      onSelect={(range: DateRange | undefined) => setPendingRange(range)}
                      numberOfMonths={2}
                      disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                    />
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-[#f0f4f8] flex items-center justify-between gap-2">
                    <p className="text-[11px] text-[#9ab0c4] m-0">
                      {!pendingRange?.from
                        ? "Click a start date"
                        : !pendingRange?.to
                        ? "Now click an end date"
                        : "Range selected ✓"
                      }
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClear}
                        className="text-xs font-medium px-3.5 py-1.5 rounded-lg border-[1.5px] border-[#e2eaf2] bg-white text-[#9ab0c4] cursor-pointer hover:border-[#c5d5e4] transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleApply}
                        disabled={!hasPending}
                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border-[1.5px] transition-all
                          ${hasPending
                            ? "border-[#155183] bg-[#155183] text-white cursor-pointer hover:bg-[#0d3d63]"
                            : "border-[#e2eaf2] bg-[#e8f0f8] text-[#9ab0c4] cursor-default"
                          }`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className={`flex items-center gap-1.5 text-xs font-medium text-[#155183] bg-white border-[1.5px] border-[#155183] rounded-lg px-3.5 py-1.75 cursor-pointer transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
            >
              <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <Fish size={28} color="#155183" className="animate-pulse" />
              <p className="text-[13px] text-[#155183] opacity-50 m-0">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stat cards */}
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

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-2xl p-5 border-[1.5px] border-[#e2eaf2]">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-1">Production Quantity</p>
                <p className="text-[11px] text-[#9ab0c4] mb-4">kg per record (oldest → newest)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={productionChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2eaf2" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ab0c4" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ab0c4" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1.5px solid #e2eaf2", fontSize: 12 }} />
                    <Bar dataKey="kg" fill="#155183" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl p-5 border-[1.5px] border-[#e2eaf2]">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-1">Satisfaction Trend</p>
                <p className="text-[11px] text-[#9ab0c4] mb-4">score per record (1–5, oldest → newest)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={productionChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2eaf2" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ab0c4" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: "#9ab0c4" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1.5px solid #e2eaf2", fontSize: 12 }} />
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

            {/* Farms + Roles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

              {/* Recent Farms */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 border-[1.5px] border-[#e2eaf2]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] m-0">Recent Farms</p>
                  <span className="text-[11px] text-[#9ab0c4]">{data?.recentFarms?.length ?? 0} shown</span>
                </div>
                <div className="flex flex-col">
                  {data?.recentFarms?.map((farm: FarmsFarmModel) => (
                    <div key={farm.id} className="flex items-center gap-3 py-2.5 border-b border-[#f0f4f8] last:border-0">
                      <div className="w-8.5 h-8.5 rounded-[9px] bg-[#e8f0f8] flex items-center justify-center shrink-0 text-[#155183]">
                        <Fish size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0d2e47] m-0 truncate">{farm.name}</p>
                        <p className="text-[11px] text-[#9ab0c4] m-0">by {farm.users_customuser?.username}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#9ab0c4] shrink-0">
                        <span className="flex items-center gap-1"><Users size={10} /> {farm.memberCount}</span>
                        <span className="flex items-center gap-1"><Layers size={10} /> {farm.trayCount}</span>
                        <span className="bg-[#e8f0f8] text-[#155183] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {new Date(farm.create_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!data?.recentFarms?.length && (
                    <p className="text-[13px] text-[#c5d5e4] text-center py-6 m-0">No farms yet</p>
                  )}
                </div>
              </div>

              {/* Users by Role */}
              <div className="bg-white rounded-2xl p-5 border-[1.5px] border-[#e2eaf2]">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-4">Users by Role</p>
                <div className="flex flex-col gap-2.5">
                  {data?.usersByRole?.map((r: UsersCustomUser) => (
                    <div key={r.role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#155183]" />
                        <p className="text-[13px] text-[#0d2e47] m-0 capitalize">{r.role || "—"}</p>
                      </div>
                      <span className="text-xs font-bold text-[#155183] bg-[#e8f0f8] px-2.5 py-0.5 rounded-full">
                        {r._count}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t-[1.5px] border-[#f0f4f8]">
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-3">Avg Satisfaction</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[32px]">
                      {SATISFACTION_EMOJIS[Math.round(data?.stats.avgSatisfaction ?? 3) - 1]}
                    </span>
                    <div>
                      <p className="text-[22px] font-bold text-[#0d2e47] tracking-tight m-0">
                        {Number(data?.stats.avgSatisfaction ?? 0).toFixed(1)}
                        <span className="text-[13px] font-normal text-[#9ab0c4]"> / 5</span>
                      </p>
                      <p className="text-[11px] text-[#9ab0c4] m-0">across all production</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Production + Announcements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Recent Production */}
              <div className="bg-white rounded-2xl p-5 border-[1.5px] border-[#e2eaf2]">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-4">Recent Production</p>
                <div className="flex flex-col">
                  {data?.recentProduction?.map((p: ProductionFarmProductionModel) => (
                    <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-[#f0f4f8] last:border-0">
                      <span className="text-[22px] shrink-0">{SATISFACTION_EMOJIS[(p.satisfaction ?? 3) - 1]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0d2e47] m-0 truncate">{p.title}</p>
                        <p className="text-[11px] text-[#9ab0c4] m-0 flex items-center gap-1">
                          <Fish size={9} /> {p.farms_farmmodel?.name}
                          {p.landing && <><MapPin size={9} className="ml-1" />{p.landing}</>}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-bold text-[#155183] m-0">{p.quantity} kg</p>
                        <p className="text-[10px] text-[#9ab0c4] m-0">
                          {new Date(p.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!data?.recentProduction?.length && (
                    <p className="text-[13px] text-[#c5d5e4] text-center py-6 m-0">No production records</p>
                  )}
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-white rounded-2xl p-5 border-[1.5px] border-[#e2eaf2]">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-4">Announcements</p>
                <div className="flex flex-col">
                  {data?.recentAnnouncements?.map((a: AnnouncementsAnnouncementModel) => (
                    <div key={a.id} className="flex items-start gap-2.5 py-2.5 border-b border-[#f0f4f8] last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.status === "active" ? "bg-green-500" : "bg-[#c5d5e4]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0d2e47] m-0 truncate">{a.title}</p>
                        <p className="text-[11px] text-[#9ab0c4] m-0">
                          {a.farms_farmmodel?.name} · by {a.users_customuser?.username}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.75 rounded-full shrink-0 mt-0.5
                        ${a.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-[#f0f4f8] text-[#9ab0c4]"
                        }`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                  {!data?.recentAnnouncements?.length && (
                    <p className="text-[13px] text-[#c5d5e4] text-center py-6 m-0">No announcements</p>
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