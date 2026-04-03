"use client"

import { useState } from "react"
import {
  Fish, Users, Layers, Search, MoreHorizontal,
  Eye, CalendarDays, ShieldCheck, Package, Megaphone,
  TrendingUp, X, ChevronRight,
  MapPlusIcon
} from "lucide-react"
import Sidebar from "@/components/container/Sidebar"
import { useFarmsQuery } from "@/store/farmApi"
import { SessionUser } from "@/lib/session"
import Link from "next/link"
import CreateFarmDialog from "./_components/CreateFarmDialog"

const SATISFACTION_EMOJIS = ["😞", "😐", "🙂", "😊", "😁"]

// ── Types ────────────────────────────────────────────────────────────────────
interface Farm {
  id: string
  name: string
  description?: string
  image_url?: string
  create_at: string
  users_customuser?: { id: string; username: string; email: string; profile_picture?: string }
  memberCount: number
  trayCount: number
  activeTrayCount: number
  sessionCount: number
  activeSessionCount: number
  productionCount: number
  totalProductionKg: number
  avgSatisfaction: number
  activeAnnouncementCount: number
}

// ── Farm card ────────────────────────────────────────────────────────────────
function FarmCard({ farm, onView }: { farm: Farm; onView: (f: Farm) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const sat = Math.round(farm.avgSatisfaction)

  return (
    <div
      className="bg-white border-[1.5px] border-[#e2eaf2] rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(21,81,131,0.10)] hover:-translate-y-px"
      onClick={() => onView(farm)}
    >
      {/* Image / placeholder */}
      <div
        className="h-24 flex items-center justify-center relative shrink-0"
        style={{
          background: farm.image_url
            ? `url(${farm.image_url}) center/cover no-repeat`
            : "linear-gradient(135deg, #e8f0f8 0%, #c8ddf0 100%)",
        }}
      >
        {!farm.image_url && <Fish size={28} className="text-[#155183] opacity-25" />}

        {/* Owner pill */}
        <div className="absolute bottom-2 left-2.5 bg-white/90 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-[#155183] flex items-center gap-1">
          <ShieldCheck size={9} />
          {farm.users_customuser?.username ?? "—"}
        </div>

        {/* Menu */}
        <div
          className="absolute top-2 right-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-[26px] h-[26px] rounded-lg bg-white/90 border-0 cursor-pointer flex items-center justify-center text-[#155183] hover:bg-white transition-colors"
          >
            <MoreHorizontal size={13} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-[9]"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute top-8 right-0 z-10 bg-white border-[1.5px] border-[#e2eaf2] rounded-xl py-1 min-w-[130px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <button
                  onClick={() => { onView(farm); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-[#0d2e47] bg-transparent border-0 cursor-pointer hover:bg-[#f0f4f8] transition-colors"
                >
                  <Eye size={12} /> View details
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 flex-1 flex flex-col gap-2.5">
        <div>
          <p className="text-[13px] font-bold text-[#0d2e47] m-0 truncate">
            {farm.name}
          </p>
          {farm.description ? (
            <p
              className="text-[11px] text-[#9ab0c4] mt-0.5 m-0 leading-snug"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {farm.description}
            </p>
          ) : (
            <p className="text-[11px] text-[#c5d5e4] mt-0.5 m-0 italic">No description</p>
          )}
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Members", value: farm.memberCount, icon: <Users size={9} /> },
            { label: "Trays", value: farm.trayCount, icon: <Layers size={9} /> },
            { label: "Sessions", value: farm.sessionCount, icon: <Fish size={9} /> },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#f0f4f8] rounded-lg py-1.5 px-1 flex flex-col items-center gap-0.5"
            >
              <span className="text-sm font-bold text-[#155183] leading-none">{s.value}</span>
              <span className="text-[9px] text-[#9ab0c4] flex items-center gap-1">
                {s.icon} {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-0.5">
          <span className="text-[10px] text-[#9ab0c4] flex items-center gap-1">
            <CalendarDays size={9} />
            {new Date(farm.create_at).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {farm.avgSatisfaction > 0 && (
            <span className="text-[13px]">
              {SATISFACTION_EMOJIS[Math.max(0, Math.min(4, sat - 1))]}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Detail drawer ─────────────────────────────────────────────────────────────
function FarmDrawer({ farm, onClose }: { farm: Farm; onClose: () => void }) {
  const sat = Math.round(farm.avgSatisfaction)

  const detailRows = [
    { label: "Owner", value: farm.users_customuser?.username ?? "—" },
    { label: "Email", value: farm.users_customuser?.email ?? "—" },
    {
      label: "Created",
      value: new Date(farm.create_at).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  ]

  const statTiles = [
    { label: "Members", value: farm.memberCount, icon: <Users size={13} />, sub: null },
    { label: "Trays", value: farm.trayCount, icon: <Layers size={13} />, sub: `${farm.activeTrayCount} active` },
    { label: "Sessions", value: farm.sessionCount, icon: <Fish size={13} />, sub: `${farm.activeSessionCount} active` },
    { label: "Production", value: farm.productionCount, icon: <Package size={13} />, sub: `${Number(farm.totalProductionKg).toFixed(1)} kg` },
    { label: "Announcements", value: farm.activeAnnouncementCount, icon: <Megaphone size={13} />, sub: "active" },
    {
      label: "Avg Satisfaction",
      value: farm.avgSatisfaction > 0 ? `${Number(farm.avgSatisfaction).toFixed(1)}/5` : "—",
      icon: <TrendingUp size={13} />,
      sub: farm.avgSatisfaction > 0 ? SATISFACTION_EMOJIS[Math.max(0, Math.min(4, sat - 1))] : null,
    },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-[100]"
      />

      {/* Drawer: full-width on mobile, fixed 360px on sm+ */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[360px] bg-white z-[101] shadow-2xl flex flex-col overflow-y-auto">

        {/* Hero */}
        <div
          className="h-32 shrink-0 flex items-center justify-center relative"
          style={{
            background: farm.image_url
              ? `url(${farm.image_url}) center/cover no-repeat`
              : "linear-gradient(135deg, #e8f0f8 0%, #b8d4ec 100%)",
          }}
        >
          {!farm.image_url && <Fish size={36} className="text-[#155183] opacity-20" />}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/90 border-0 cursor-pointer text-[#155183] flex items-center justify-center hover:bg-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Title */}
          <div>
            <h2 className="text-[17px] font-bold text-[#0d2e47] m-0 mb-1 tracking-tight">
              {farm.name}
            </h2>
            <p className="text-xs text-[#9ab0c4] m-0">
              {farm.description ?? "No description provided"}
            </p>
          </div>

          {/* Stat grid */}
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-2.5 m-0">
              Overview
            </p>
            <div className="grid grid-cols-3 gap-2">
              {statTiles.map((s) => (
                <div
                  key={s.label}
                  className="bg-[#f0f4f8] rounded-xl p-2.5 flex flex-col items-center gap-0.5"
                >
                  <span className="text-[#155183]">{s.icon}</span>
                  <span className="text-base font-bold text-[#0d2e47] leading-none">{s.value}</span>
                  <span className="text-[9px] text-[#9ab0c4] text-center">{s.label}</span>
                  {s.sub && (
                    <span className="text-[9px] text-[#155183] font-semibold">{s.sub}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-2.5 m-0">
              Details
            </p>
            {detailRows.map((row, i) => (
              <div
                key={row.label}
                className={`flex justify-between items-center gap-3 py-2.5 ${
                  i < detailRows.length - 1 ? "border-b border-[#f0f4f8]" : ""
                }`}
              >
                <span className="text-xs text-[#9ab0c4] shrink-0">{row.label}</span>
                <span className="text-xs font-semibold text-[#0d2e47] text-right truncate max-w-[55%]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* View full button */}
          <Link
            href={`/farms/${farm.id}`}
            className="flex items-center justify-center gap-1.5 bg-[#155183] text-white rounded-xl py-3 text-[13px] font-semibold no-underline hover:bg-[#0d3f6b] transition-colors"
          >
            View Full Farm <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function FarmsPage({ user }: { user: SessionUser }) {
  const { data: farms = [], isLoading } = useFarmsQuery()
  const [search, setSearch] = useState("")
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
  const [createFarmOpen, setCreateFarmOpen] = useState(false)

  const filtered: Farm[] = farms.filter((f: Farm) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.users_customuser?.username ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex">
      <Sidebar active="Farms" user={user} />

      <main className="flex-1 lg:ml-56 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 mt-5">
        <CreateFarmDialog open={createFarmOpen} onOpenChange={setCreateFarmOpen} />

        {/* Header */}
        <div className="flex items-start justify-between mb-5 gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] opacity-60 mb-1 m-0">
              Management
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0d2e47] tracking-tight m-0">
              Farms
            </h1>
          </div>

          {/* Create button */}
          <button
            onClick={() => setCreateFarmOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#155183] bg-white border-[1.5px] border-[#155183] rounded-lg px-3 py-2 cursor-pointer hover:bg-[#e8f0f8] transition-colors whitespace-nowrap shrink-0"
          >
            <MapPlusIcon size={13} />
            <span className="hidden sm:inline">Create Farm</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 bg-white border-[1.5px] border-[#e2eaf2] rounded-xl px-4 py-2.5 flex items-center gap-2.5">
            <Search size={14} className="text-[#9ab0c4] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search farms or owners…"
              className="flex-1 border-none outline-none text-[13px] text-[#0d2e47] bg-transparent placeholder:text-[#c5d5e4] min-w-0"
            />
            <span className="text-[11px] font-semibold text-[#155183] bg-[#e8f0f8] px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
              {filtered.length} farm{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-2.5">
              <Fish size={28} className="text-[#155183] animate-pulse" />
              <p className="text-[13px] text-[#155183] opacity-50 m-0">Loading farms…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-[1.5px] border-[#e2eaf2] rounded-2xl flex flex-col items-center justify-center py-16 px-5 gap-2.5">
            <Fish size={32} className="text-[#155183] opacity-20" />
            <p className="text-sm text-[#9ab0c4] m-0">
              {search ? "No farms match your search" : "No farms yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((farm: Farm) => (
              <FarmCard key={String(farm.id)} farm={farm} onView={setSelectedFarm} />
            ))}
          </div>
        )}
      </main>

      {selectedFarm && (
        <FarmDrawer farm={selectedFarm} onClose={() => setSelectedFarm(null)} />
      )}
    </div>
  )
}