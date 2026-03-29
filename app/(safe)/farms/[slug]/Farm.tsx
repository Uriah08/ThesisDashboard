"use client"

import { SessionUser } from "@/lib/session"
import { useFarmQuery } from "@/store/farmApi"
import Sidebar from "@/components/container/Sidebar"
import {
  Fish, Users, Layers, Package, CalendarDays, ArrowLeft, MapPin,
  Factory,
  CalendarIcon,
  X
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
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "#155183", borderRadius: 14, padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 8, color: "#fff",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7, margin: 0 }}>
          {label}
        </p>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, opacity: 0.6, margin: 0 }}>{sub}</p>}
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const active = status === "active"
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
      background: active ? "#dcfce7" : "#f0f4f8",
      color: active ? "#15803d" : "#9ab0c4",
    }}>
      {status}
    </span>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #e2eaf2", borderRadius: 14, padding: "20px 22px" }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 16px" }}>
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

  const sat = Math.round(farm?.avgSatisfaction ?? 0)

  return (
    <div className="overflow-hidden" style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex" }}>
      <Sidebar user={user} active="Farms" />

      <main className="flex-1 lg:ml-56 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 mt-5">

        <CreateProductionDialog
          open={showCreateProduction}
          onOpenChange={setShowCreateProduction}
          farms={params.id}
        />

        {/* Back + header */}
        <div style={{ marginBottom: 24 }}>
          <Link
            href="/farms"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, color: "#155183", fontWeight: 500,
              textDecoration: "none", marginBottom: 12, opacity: 0.7,
            }}>
            <ArrowLeft size={13} /> Back to Farms
          </Link>
          <div className="flex justify-between items-center">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Farm image */}
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: farm?.image_url
                  ? `url(${farm.image_url}) center/cover no-repeat`
                  : "linear-gradient(135deg, #e8f0f8, #c8ddf0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1.5px solid #e2eaf2",
              }}>
                {!farm?.image_url && <Fish size={20} color="#155183" opacity={0.4} />}
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", opacity: 0.6, margin: "0 0 2px" }}>
                  Farm
                </p>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d2e47", margin: 0, letterSpacing: "-0.02em" }}>
                  {isLoading ? "Loading…" : farm?.name}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
              <button
                onClick={() => setShowCreateProduction(true)}
                className={`flex items-center gap-1.5 text-xs font-medium text-[#155183] bg-white border-[1.5px] border-[#155183] rounded-lg px-3.5 py-1.75 cursor-pointer transition-opacity`}
              >
                <Factory size={13} />
                Add Production
              </button>
              <button
                onClick={() => farm && exportFarmToExcel(farm, appliedRange)}
                disabled={!farm}
                className="flex items-center gap-1.5 text-xs font-medium text-[#155183] bg-white border-[1.5px] border-[#155183] rounded-lg px-3.5 py-1.75 cursor-pointer transition-opacity"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Fish size={28} color="#155183" className="animate-pulse" />
              <p style={{ fontSize: 13, color: "#155183", opacity: 0.5, margin: 0 }}>Loading farm…</p>
            </div>
          </div>
        ) : !farm ? (
          <div style={{
            background: "#fff", border: "1.5px solid #e2eaf2", borderRadius: 14,
            padding: "60px 20px", textAlign: "center",
          }}>
            <p style={{ fontSize: 14, color: "#9ab0c4", margin: 0 }}>Farm not found</p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
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

            {/* ── Charts ───────────────────────────────────────────────────────────── */}
{(() => {
  type DayAcc = Record<string, { kg: number; satisfaction: number; count: number }>

const productionChartData = (Object.entries(
  [...(farm.production ?? [])]
    .reverse()
    .reduce((acc: DayAcc, p: Production) => {
      const day = new Date(p.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
      if (!acc[day]) acc[day] = { kg: 0, satisfaction: 0, count: 0 }
      acc[day].kg           += Number(p.quantity)
      acc[day].satisfaction += p.satisfaction
      acc[day].count        += 1
      return acc
    }, {})
) as [string, { kg: number; satisfaction: number; count: number }][])
  .map(([name, val]) => ({
    name,
    kg:           parseFloat(val.kg.toFixed(2)),
    satisfaction: parseFloat((val.satisfaction / val.count).toFixed(2)),
  }))

  const traySteps: { detected: number; rejects: number }[] = farm.traySteps ?? []
  const totalDetected = traySteps.reduce((sum, s) => sum + (s.detected ?? 0), 0)
  const totalRejects  = traySteps.reduce((sum, s) => sum + (s.rejects  ?? 0), 0)
  const rejectRate    = totalDetected > 0 ? (totalRejects / totalDetected) * 100 : 0

  const trayStepChartData = [
    { name: "Detected", value: totalDetected },
    { name: "Rejects",  value: totalRejects  },
  ]

  const TOOLTIP_STYLE = { borderRadius: 8, border: "1.5px solid #e2eaf2", fontSize: 12 }
  const TICK_STYLE    = { fontSize: 10, fill: "#9ab0c4" }

  return (
    <>
      {/* Row 1 — Production Quantity + Detected vs Rejects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">

        {/* Production Quantity */}
        <div className="bg-white rounded-2xl p-5 border-[1.5px] border-[#e2eaf2]">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-1">Production Quantity</p>
          <p className="text-[11px] text-[#9ab0c4] mb-4">kg per record (oldest → newest)</p>
          <ResponsiveContainer width="100%" height={220}>
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
        <div className="bg-white rounded-2xl p-5 border-[1.5px] border-[#e2eaf2]">
          <div className="flex items-start justify-between mb-1">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] m-0">
              Fish Detected vs Rejects
            </p>
            {rejectRate > 15 && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                ⚠️ High rejects ({rejectRate.toFixed(1)}%)
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#9ab0c4] mb-4">per tray step</p>
          <ResponsiveContainer width="100%" height={220}>
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

      {/* Row 2 — Satisfaction Trend full width */}
      <div className="mb-4">
        <div className="bg-white rounded-2xl p-5 border-[1.5px] border-[#e2eaf2]">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-1">Satisfaction Trend</p>
          <p className="text-[11px] text-[#9ab0c4] mb-4">score per record</p>
          <ResponsiveContainer width="100%" height={220}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

              {/* About */}
              <Section title="About">
                {farm.description && (
                  <p style={{ fontSize: 13, color: "#0d2e47", margin: "0 0 16px", lineHeight: 1.6 }}>{farm.description}</p>
                )}
                {[
                  { label: "Owner", value: farm.users_customuser?.username ?? "—" },
                  { label: "Email", value: farm.users_customuser?.email ?? "—" },
                  { label: "Role", value: farm.users_customuser?.role ?? "—" },
                  { label: "Created", value: new Date(farm.create_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) },
                  { label: "Avg Satisfaction", value: farm.avgSatisfaction > 0 ? `${SATISFACTION_EMOJIS[Math.max(0, Math.min(4, sat - 1))]} ${Number(farm.avgSatisfaction).toFixed(1)} / 5` : "—" },
                ].map(row => (
                  <div key={row.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0", borderBottom: "1px solid #f0f4f8",
                  }} className="last:border-0">
                    <span style={{ fontSize: 12, color: "#9ab0c4" }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0d2e47" }}>{row.value}</span>
                  </div>
                ))}
              </Section>

              {/* Members */}
              <div className="lg:col-span-2 f-full">
                <Section title={`Members · ${farm.memberCount}`}>
                  {farm.members.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#c5d5e4", textAlign: "center", padding: "16px 0", margin: 0 }}>No members yet</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {farm.members.map((m: Member) => (
                        <div key={String(m.id)} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 0", borderBottom: "1px solid #f0f4f8",
                        }} className="last:border-0">
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                            background: m.profile_picture ? `url(${m.profile_picture}) center/cover` : "#e8f0f8",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: "#155183",
                          }}>
                            {!m.profile_picture && m.username[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#0d2e47", margin: 0 }}>{m.username}</p>
                            <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</p>
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 600, color: "#155183",
                            background: "#e8f0f8", padding: "2px 9px", borderRadius: 20,
                            textTransform: "capitalize", flexShrink: 0,
                          }}>
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

              {/* Trays */}
              <Section title={`Trays · ${farm.trayCount}`}>
                {farm.trays.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#c5d5e4", textAlign: "center", padding: "16px 0", margin: 0 }}>No trays yet</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {farm.trays.map((t: Tray) => (
                      <div key={String(t.id)} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 0", borderBottom: "1px solid #f0f4f8",
                      }} className="last:border-0">
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: "#e8f0f8", display: "flex", alignItems: "center", justifyContent: "center", color: "#155183",
                        }}>
                          <Layers size={13} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#0d2e47", margin: 0 }}>{t.name}</p>
                          <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
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
                  <p style={{ fontSize: 13, color: "#c5d5e4", textAlign: "center", padding: "16px 0", margin: 0 }}>No production records</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {farm.production.map((p: Production) => (
                      <div key={String(p.id)} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 0", borderBottom: "1px solid #f0f4f8",
                      }} className="last:border-0">
                        <span style={{ fontSize: 20, flexShrink: 0 }}>
                          {SATISFACTION_EMOJIS[Math.max(0, Math.min(4, p.satisfaction - 1))]}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#0d2e47", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.title}
                          </p>
                          <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
                            {p.landing && <><MapPin size={9} />{p.landing} · </>}
                            <CalendarDays size={9} />
                            {new Date(p.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#155183", margin: 0 }}>{p.quantity} kg</p>
                        </div>
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