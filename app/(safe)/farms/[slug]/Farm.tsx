"use client"

import { SessionUser } from "@/lib/session"
import { useFarmQuery } from "@/store/farmApi"
import Sidebar from "@/components/container/Sidebar"
import {
  Fish, Users, Layers, Package, CalendarDays, ArrowLeft, MapPin,
  Factory, CalendarIcon, X
} from "lucide-react"
import Link from "next/link"
import CreateProductionDialog from "../_components/CreateProductionDIalog"
import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { exportFarmToExcel } from "../_components/ExportFarmExcel"
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts"

const SATISFACTION_EMOJIS = ["😞", "😐", "🙂", "😊", "😁"]

// ── Types ─────────────────────────────────────────────────────────────────────
interface Member {
  id: string
  username: string
  email: string
  profile_picture?: string
  role: string
}

interface Tray {
  id: string
  name: string
  description?: string
  status: string
  created_at: string
}

interface Production {
  id: string
  title: string
  notes?: string
  satisfaction: number
  quantity: number
  landing?: string
  created_at: string
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string
}) {
  return (
    <div className="bg-[#155183] rounded-2xl p-4 sm:p-[18px_20px] flex flex-col gap-2 text-white">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold tracking-widest uppercase opacity-70 m-0">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold m-0 tracking-tight leading-none">{value}</p>
      {sub && <p className="text-[10px] opacity-60 m-0">{sub}</p>}
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const active = status === "active"
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
      active ? "bg-green-100 text-green-700" : "bg-[#f0f4f8] text-[#9ab0c4]"
    }`}>
      {status}
    </span>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-[1.5px] border-[#e2eaf2] rounded-2xl p-5">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-4 m-0">
        {title}
      </p>
      {children}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FarmPage({ user, params }: { user: SessionUser; params: { id: string } }) {

  const [pendingRange, setPendingRange] = useState<DateRange | undefined>(undefined)
  const [appliedRange, setAppliedRange] = useState<DateRange | undefined>(undefined)
  const [showCreateProduction, setShowCreateProduction] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const { data: farm, isLoading } = useFarmQuery(params.id, appliedRange)

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

  const handleApply = () => { setAppliedRange(pendingRange); setCalendarOpen(false) }
  const handleClear = () => { setPendingRange(undefined); setAppliedRange(undefined); setCalendarOpen(false) }

  const hasApplied = appliedRange?.from && appliedRange?.to
  const hasPending = pendingRange?.from && pendingRange?.to
  const sat = Math.round(farm?.avgSatisfaction ?? 0)

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex overflow-hidden">
      <Sidebar user={user} active="Farms" />

      <main className="flex-1 lg:ml-56 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 mt-5">

        <CreateProductionDialog
          open={showCreateProduction}
          onOpenChange={setShowCreateProduction}
          farms={params.id}
        />

        {/* ── Back + Header ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <Link
            href="/farms"
            className="inline-flex items-center gap-1.5 text-xs text-[#155183] font-medium no-underline mb-3 opacity-70 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft size={13} /> Back to Farms
          </Link>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            {/* Farm identity */}
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-xl shrink-0 border-[1.5px] border-[#e2eaf2] flex items-center justify-center"
                style={{
                  background: farm?.image_url
                    ? `url(${farm.image_url}) center/cover no-repeat`
                    : "linear-gradient(135deg, #e8f0f8, #c8ddf0)",
                }}
              >
                {!farm?.image_url && <Fish size={20} className="text-[#155183] opacity-40" />}
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] opacity-60 m-0 mb-0.5">
                  Farm
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0d2e47] m-0 tracking-tight">
                  {isLoading ? "Loading…" : farm?.name}
                </h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">

              {/* Date range picker */}
              <div ref={calendarRef} className="relative">
                <div className="flex items-center">
                  <button
                    onClick={() => { setPendingRange(appliedRange); setCalendarOpen((p) => !p) }}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 border-[1.5px] border-[#155183] cursor-pointer transition-all whitespace-nowrap
                      ${hasApplied
                        ? "bg-[#155183] text-white rounded-l-lg rounded-r-none border-r-0"
                        : "bg-white text-[#155183] rounded-lg"
                      }`}
                  >
                    <CalendarIcon size={13} />
                    <span className="hidden sm:inline">
                      {hasApplied
                        ? `${format(appliedRange!.from!, "MMM d")} – ${format(appliedRange!.to!, "MMM d, yyyy")}`
                        : "All time"
                      }
                    </span>
                    <span className="sm:hidden">
                      {hasApplied ? "Filtered" : "Date"}
                    </span>
                  </button>
                  {hasApplied && (
                    <button
                      onClick={handleClear}
                      className="flex items-center justify-center px-2.5 py-2 rounded-r-lg border-[1.5px] border-[#155183] border-l-white/30 bg-[#155183] text-white cursor-pointer hover:bg-[#0d3d63] transition-colors"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>

                {/* Calendar dropdown */}
                {calendarOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 z-50 bg-white rounded-2xl border-[1.5px] border-[#e2eaf2] shadow-[0_8px_32px_rgba(21,81,131,0.13)] overflow-hidden
                    w-[calc(100vw-32px)] sm:w-auto max-w-[calc(100vw-32px)]">

                    {/* Dropdown header */}
                    <div className="px-4 py-3 border-b border-[#f0f4f8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
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

                    {/* Single month on mobile, two on sm+ */}
                    <div className="rdp-dashboard overflow-x-auto">
                      <div className="hidden sm:block">
                        <Calendar
                          mode="range"
                          defaultMonth={pendingRange?.from ?? new Date()}
                          selected={pendingRange}
                          onSelect={(range: DateRange | undefined) => setPendingRange(range)}
                          numberOfMonths={2}
                          disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                        />
                      </div>
                      <div className="sm:hidden">
                        <Calendar
                          mode="range"
                          defaultMonth={pendingRange?.from ?? new Date()}
                          selected={pendingRange}
                          onSelect={(range: DateRange | undefined) => setPendingRange(range)}
                          numberOfMonths={1}
                          disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-[#f0f4f8] flex items-center justify-between gap-2">
                      <p className="text-[11px] text-[#9ab0c4] m-0 hidden sm:block">
                        {!pendingRange?.from
                          ? "Click a start date"
                          : !pendingRange?.to
                          ? "Now click an end date"
                          : "Range selected ✓"
                        }
                      </p>
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={handleClear}
                          className="text-xs font-medium px-3.5 py-1.5 rounded-lg border-[1.5px] border-[#e2eaf2] bg-white text-[#9ab0c4] cursor-pointer hover:border-[#c5d5e4] transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={handleApply}
                          disabled={!hasPending}
                          className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border-[1.5px] transition-all ${
                            hasPending
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

              {/* Add Production */}
              <button
                onClick={() => setShowCreateProduction(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#155183] bg-white border-[1.5px] border-[#155183] rounded-lg px-3 py-2 cursor-pointer hover:bg-[#e8f0f8] transition-colors whitespace-nowrap"
              >
                <Factory size={13} />
                <span className="hidden sm:inline">Add Production</span>
                <span className="sm:hidden">Add</span>
              </button>

              {/* Export */}
              <button
                onClick={() => farm && exportFarmToExcel(farm, appliedRange)}
                disabled={!farm}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#155183] bg-white border-[1.5px] border-[#155183] rounded-lg px-3 py-2 cursor-pointer hover:bg-[#e8f0f8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* ── Loading / Not found ───────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-2.5">
              <Fish size={28} className="text-[#155183] animate-pulse" />
              <p className="text-[13px] text-[#155183] opacity-50 m-0">Loading farm…</p>
            </div>
          </div>
        ) : !farm ? (
          <div className="bg-white border-[1.5px] border-[#e2eaf2] rounded-2xl py-16 px-5 text-center">
            <p className="text-sm text-[#9ab0c4] m-0">Farm not found</p>
          </div>
        ) : (
          <>
            {/* ── Stat cards ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <StatCard icon={<Users size={13} color="#fff" />} label="Members" value={farm.memberCount} />
              <StatCard icon={<Layers size={13} color="#fff" />} label="Trays" value={farm.trayCount} sub={`${farm.activeTrayCount} active`} />
              <StatCard
                icon={<Fish size={13} color="#fff" />}
                label="Total Sales"
                value={`₱ ${Number(farm.totalSales).toLocaleString()}`}
              />
              <StatCard
                icon={<Package size={13} color="#fff" />}
                label="Production"
                value={`${Number(farm.totalProductionKg).toFixed(1)} kg`}
                sub={`${farm.productionCount} records`}
              />
            </div>

            {/* ── Charts ───────────────────────────────────────────────────── */}
            {(() => {
              type DayAcc = Record<string, { kg: number; satisfaction: number; count: number }>

              const productionChartData = (Object.entries(
                [...(farm.production ?? [])]
                  .reverse()
                  .reduce((acc: DayAcc, p: Production) => {
                    const day = new Date(p.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
                    if (!acc[day]) acc[day] = { kg: 0, satisfaction: 0, count: 0 }
                    acc[day].kg += Number(p.quantity)
                    acc[day].satisfaction += p.satisfaction
                    acc[day].count += 1
                    return acc
                  }, {})
              ) as [string, { kg: number; satisfaction: number; count: number }][])
                .map(([name, val]) => ({
                  name,
                  kg: parseFloat(val.kg.toFixed(2)),
                  satisfaction: parseFloat((val.satisfaction / val.count).toFixed(2)),
                }))

              const traySteps: { detected: number; rejects: number }[] = farm.traySteps ?? []
              const totalDetected = traySteps.reduce((sum, s) => sum + (s.detected ?? 0), 0)
              const totalRejects = traySteps.reduce((sum, s) => sum + (s.rejects ?? 0), 0)
              const rejectRate = totalDetected > 0 ? (totalRejects / totalDetected) * 100 : 0
              const trayStepChartData = [
                { name: "Detected", value: totalDetected },
                { name: "Rejects", value: totalRejects },
              ]

              const TOOLTIP_STYLE = { borderRadius: 8, border: "1.5px solid #e2eaf2", fontSize: 12 }
              const TICK_STYLE = { fontSize: 10, fill: "#9ab0c4" }

              return (
                <>
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">

                    {/* Production Quantity */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border-[1.5px] border-[#e2eaf2]">
                      <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-1 m-0">
                        Production Quantity
                      </p>
                      <p className="text-[11px] text-[#9ab0c4] mb-4 m-0">kg per record (oldest → newest)</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={productionChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2eaf2" vertical={false} />
                          <XAxis dataKey="name" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
                          <Bar dataKey="kg" name="kg" fill="#155183" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Fish Detected vs Rejects */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border-[1.5px] border-[#e2eaf2]">
                      <div className="flex items-start justify-between mb-1 gap-2 flex-wrap">
                        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] m-0">
                          Fish Detected vs Rejects
                        </p>
                        {rejectRate > 15 && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                            ⚠️ High rejects ({rejectRate.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9ab0c4] mb-4 m-0">per tray step</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={trayStepChartData} layout="vertical" margin={{ top: 4, right: 8, left: 16, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2eaf2" horizontal={false} />
                          <XAxis type="number" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            <Cell fill="#155183" />
                            <Cell fill="#e05252" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Row 2 — Satisfaction Trend */}
                  <div className="mb-4">
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border-[1.5px] border-[#e2eaf2]">
                      <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-1 m-0">
                        Satisfaction Trend
                      </p>
                      <p className="text-[11px] text-[#9ab0c4] mb-4 m-0">score per record</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={productionChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2eaf2" vertical={false} />
                          <XAxis dataKey="name" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={TICK_STYLE} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
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
                </>
              )
            })()}

            {/* ── About + Members ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

              {/* About */}
              <Section title="About">
                {farm.description && (
                  <p className="text-[13px] text-[#0d2e47] mb-4 m-0 leading-relaxed">{farm.description}</p>
                )}
                {[
                  { label: "Owner", value: farm.users_customuser?.username ?? "—" },
                  { label: "Email", value: farm.users_customuser?.email ?? "—" },
                  { label: "Role", value: farm.users_customuser?.role ?? "—" },
                  {
                    label: "Created",
                    value: new Date(farm.create_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
                  },
                  {
                    label: "Avg Satisfaction",
                    value: farm.avgSatisfaction > 0
                      ? `${SATISFACTION_EMOJIS[Math.max(0, Math.min(4, sat - 1))]} ${Number(farm.avgSatisfaction).toFixed(1)} / 5`
                      : "—",
                  },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`flex justify-between items-center gap-3 py-2 ${
                      i < arr.length - 1 ? "border-b border-[#f0f4f8]" : ""
                    }`}
                  >
                    <span className="text-xs text-[#9ab0c4] shrink-0">{row.label}</span>
                    <span className="text-xs font-semibold text-[#0d2e47] text-right truncate max-w-[55%]">{row.value}</span>
                  </div>
                ))}
              </Section>

              {/* Members */}
              <div className="lg:col-span-2">
                <Section title={`Members · ${farm.memberCount}`}>
                  {farm.members.length === 0 ? (
                    <p className="text-[13px] text-[#c5d5e4] text-center py-4 m-0">No members yet</p>
                  ) : (
                    <div className="flex flex-col">
                      {farm.members.map((m: Member, i: number) => (
                        <div
                          key={String(m.id)}
                          className={`flex items-center gap-2.5 py-2 ${
                            i < farm.members.length - 1 ? "border-b border-[#f0f4f8]" : ""
                          }`}
                        >
                          <div
                            className="w-[30px] h-[30px] rounded-full shrink-0 bg-[#e8f0f8] flex items-center justify-center text-xs font-bold text-[#155183]"
                            style={m.profile_picture ? { backgroundImage: `url(${m.profile_picture})`, backgroundSize: "cover" } : undefined}
                          >
                            {!m.profile_picture && m.username[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#0d2e47] m-0">{m.username}</p>
                            <p className="text-[11px] text-[#9ab0c4] m-0 truncate">{m.email}</p>
                          </div>
                          <span className="text-[10px] font-semibold text-[#155183] bg-[#e8f0f8] px-2.5 py-0.5 rounded-full capitalize shrink-0">
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </div>
            </div>

            {/* ── Trays + Production ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

              {/* Trays */}
              <Section title={`Trays · ${farm.trayCount}`}>
                {farm.trays.length === 0 ? (
                  <p className="text-[13px] text-[#c5d5e4] text-center py-4 m-0">No trays yet</p>
                ) : (
                  <div className="flex flex-col">
                    {farm.trays.map((t: Tray, i: number) => (
                      <div
                        key={String(t.id)}
                        className={`flex items-center gap-2.5 py-2.5 ${
                          i < farm.trays.length - 1 ? "border-b border-[#f0f4f8]" : ""
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg shrink-0 bg-[#e8f0f8] flex items-center justify-center text-[#155183]">
                          <Layers size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#0d2e47] m-0">{t.name}</p>
                          <p className="text-[11px] text-[#9ab0c4] m-0 flex items-center gap-1">
                            <CalendarDays size={9} />
                            {new Date(t.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <StatusBadge status={t.status} />
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Production */}
              <Section title={`Production · ${farm.productionCount}`}>
                {farm.production.length === 0 ? (
                  <p className="text-[13px] text-[#c5d5e4] text-center py-4 m-0">No production records</p>
                ) : (
                  <div className="flex flex-col">
                    {farm.production.map((p: Production, i: number) => (
                      <div
                        key={String(p.id)}
                        className={`flex items-center gap-2.5 py-2.5 ${
                          i < farm.production.length - 1 ? "border-b border-[#f0f4f8]" : ""
                        }`}
                      >
                        <span className="text-xl shrink-0">
                          {SATISFACTION_EMOJIS[Math.max(0, Math.min(4, p.satisfaction - 1))]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#0d2e47] m-0 truncate">{p.title}</p>
                          <p className="text-[11px] text-[#9ab0c4] m-0 flex items-center gap-1 flex-wrap">
                            {p.landing && <><MapPin size={9} />{p.landing} · </>}
                            <CalendarDays size={9} />
                            {new Date(p.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <p className="text-[13px] font-bold text-[#155183] m-0 shrink-0">{p.quantity} kg</p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </>
        )}
      </main>
    </div>
  )
}