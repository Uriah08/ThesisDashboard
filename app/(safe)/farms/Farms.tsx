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
      style={{
        background: "#fff",
        border: "1.5px solid #e2eaf2",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow .15s, transform .15s",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(21,81,131,0.10)"
        e.currentTarget.style.transform = "translateY(-1px)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.transform = "none"
      }}
      onClick={() => onView(farm)}
    >
      {/* Image / placeholder */}
      <div style={{
        height: 100,
        background: farm.image_url
          ? `url(${farm.image_url}) center/cover no-repeat`
          : "linear-gradient(135deg, #e8f0f8 0%, #c8ddf0 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", flexShrink: 0,
      }}>
        {!farm.image_url && <Fish size={28} color="#155183" opacity={0.25} />}

        {/* Owner pill */}
        <div style={{
          position: "absolute", bottom: 8, left: 10,
          background: "rgba(255,255,255,0.92)",
          borderRadius: 20, padding: "2px 9px",
          fontSize: 10, fontWeight: 600, color: "#155183",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <ShieldCheck size={9} />
          {farm.users_customuser?.username ?? "—"}
        </div>

        {/* Menu */}
        <div
          style={{ position: "absolute", top: 8, right: 8 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              width: 26, height: 26, borderRadius: 7,
              background: "rgba(255,255,255,0.92)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#155183",
            }}
          >
            <MoreHorizontal size={13} />
          </button>
          {menuOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setMenuOpen(false)} />
              <div style={{
                position: "absolute", top: 30, right: 0, zIndex: 10,
                background: "#fff", border: "1.5px solid #e2eaf2",
                borderRadius: 10, padding: "4px 0", minWidth: 130,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}>
                <button
                  onClick={() => { onView(farm); setMenuOpen(false) }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    width: "100%", padding: "8px 14px",
                    fontSize: 12, color: "#0d2e47", background: "none",
                    border: "none", cursor: "pointer",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4f8")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <Eye size={12} /> View details
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0d2e47", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {farm.name}
          </p>
          {farm.description ? (
            <p style={{
              fontSize: 11, color: "#9ab0c4", margin: "2px 0 0", lineHeight: 1.4,
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
            }}>
              {farm.description}
            </p>
          ) : (
            <p style={{ fontSize: 11, color: "#c5d5e4", margin: "2px 0 0", fontStyle: "italic" }}>No description</p>
          )}
        </div>

        {/* Mini stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {[
            { label: "Members", value: farm.memberCount, icon: <Users size={9} /> },
            { label: "Trays", value: farm.trayCount, icon: <Layers size={9} /> },
            { label: "Sessions", value: farm.sessionCount, icon: <Fish size={9} /> },
          ].map(s => (
            <div key={s.label} style={{
              background: "#f0f4f8", borderRadius: 8, padding: "6px 4px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#155183", lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: 9, color: "#9ab0c4", display: "flex", alignItems: "center", gap: 2 }}>
                {s.icon} {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <span style={{ fontSize: 10, color: "#9ab0c4", display: "flex", alignItems: "center", gap: 3 }}>
            <CalendarDays size={9} />
            {new Date(farm.create_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          {farm.avgSatisfaction > 0 && (
            <span style={{ fontSize: 13 }}>
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
    { label: "Created", value: new Date(farm.create_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) },
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
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)", zIndex: 100 }} />
      <div style={{
        position: "fixed", top: 0, right: 0, height: "100%", width: 360,
        background: "#fff", zIndex: 101,
        boxShadow: "-4px 0 32px rgba(21,81,131,0.10)",
        display: "flex", flexDirection: "column", overflowY: "auto",
      }}>
        {/* Hero */}
        <div style={{
          height: 130, flexShrink: 0,
          background: farm.image_url
            ? `url(${farm.image_url}) center/cover no-repeat`
            : "linear-gradient(135deg, #e8f0f8 0%, #b8d4ec 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          {!farm.image_url && <Fish size={36} color="#155183" opacity={0.2} />}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 12, right: 12,
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(255,255,255,0.92)", border: "none",
              cursor: "pointer", color: "#155183",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 22 }}>

          {/* Title */}
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0d2e47", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              {farm.name}
            </h2>
            <p style={{ fontSize: 12, color: "#9ab0c4", margin: 0 }}>
              {farm.description ?? "No description provided"}
            </p>
          </div>

          {/* Stat grid */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 10px" }}>
              Overview
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {statTiles.map(s => (
                <div key={s.label} style={{
                  background: "#f0f4f8", borderRadius: 10, padding: "10px 8px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                }}>
                  <span style={{ color: "#155183" }}>{s.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#0d2e47", lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: 9, color: "#9ab0c4", textAlign: "center" }}>{s.label}</span>
                  {s.sub && <span style={{ fontSize: 9, color: "#155183", fontWeight: 600 }}>{s.sub}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 10px" }}>
              Details
            </p>
            {detailRows.map(row => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 0", borderBottom: "1px solid #f0f4f8",
              }}>
                <span style={{ fontSize: 12, color: "#9ab0c4" }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0d2e47", maxWidth: 200, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* View full button */}
          <Link
            href={`/farms/${farm.id}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "#155183", color: "#fff", borderRadius: 10,
              padding: "11px", fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}
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
    <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex" }}>
      <Sidebar active="Farms" user={user}/>

      <main className="flex-1 lg:ml-56 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 mt-5">

      <CreateFarmDialog
          open={createFarmOpen} onOpenChange={setCreateFarmOpen}/>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", opacity: 0.6, margin: "0 0 4px" }}>
              Management
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d2e47", margin: 0, letterSpacing: "-0.02em" }}>
              Farms
            </h1>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-5 mb-5">
          <div style={{
            background: "#fff", border: "1.5px solid #e2eaf2", borderRadius: 12,
            padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 10,
          }} className="flex-1">
            <Search size={14} color="#9ab0c4" style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search farms or owners…"
              style={{
                flex: 1, border: "none", outline: "none",
                fontSize: 13, color: "#0d2e47", background: "transparent",
              }}
            />
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#155183",
              background: "#e8f0f8", padding: "2px 10px", borderRadius: 20, flexShrink: 0,
            }}>
              {filtered.length} farm{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={() => setCreateFarmOpen(true)}
            className={`flex items-center gap-1.5 text-xs font-medium text-[#155183] bg-white border-[1.5px] border-[#155183] rounded-lg px-3.5 py-3 cursor-pointer transition-opacity`}
          >
            <MapPlusIcon size={13} />
            Create Farm
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Fish size={28} color="#155183" className="animate-pulse" />
              <p style={{ fontSize: 13, color: "#155183", opacity: 0.5, margin: 0 }}>Loading farms…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: "#fff", border: "1.5px solid #e2eaf2", borderRadius: 14,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "60px 20px", gap: 10,
          }}>
            <Fish size={32} color="#155183" opacity={0.2} />
            <p style={{ fontSize: 14, color: "#9ab0c4", margin: 0 }}>
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