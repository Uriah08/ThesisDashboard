"use client"

import { SessionUser } from "@/lib/session"
import { useFarmQuery } from "@/store/farmApi"
import Sidebar from "@/components/container/Sidebar"
import {
  Fish, Users, Layers, Package, Megaphone, CalendarDays, ArrowLeft, Clock, MapPin
} from "lucide-react"

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

interface Session {
  id: string
  name: string
  description?: string
  status: string
  start_time?: string
  end_time?: string
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

interface Announcement {
  id: string
  title: string
  content: string
  status: string
  created_at: string
  expires_at?: string
  users_customuser?: { username: string }
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
    console.log(params);
    
  const { data: farm, isLoading } = useFarmQuery(params.id)

  const sat = Math.round(farm?.avgSatisfaction ?? 0)

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex" }}>
      <Sidebar user={user} active="Farms" />

      <main className="flex-1 lg:ml-56 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 mt-5">

        {/* Back + header */}
        <div style={{ marginBottom: 24 }}>
          <a
            href="/farms"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, color: "#155183", fontWeight: 500,
              textDecoration: "none", marginBottom: 12, opacity: 0.7,
            }}
          >
            <ArrowLeft size={13} /> Back to Farms
          </a>
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
              <StatCard icon={<Fish size={13} color="#fff" />} label="Sessions" value={farm.sessionCount} sub={`${farm.activeSessionCount} active`} />
              <StatCard
                icon={<Package size={13} color="#fff" />}
                label="Production"
                value={`${Number(farm.totalProductionKg).toFixed(1)} kg`}
                sub={`${farm.productionCount} records`}
              />
            </div>

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

              {/* Sessions */}
              <Section title={`Sessions · ${farm.sessionCount}`}>
                {farm.sessions.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#c5d5e4", textAlign: "center", padding: "16px 0", margin: 0 }}>No sessions yet</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {farm.sessions.map((s: Session) => (
                      <div key={String(s.id)} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 0", borderBottom: "1px solid #f0f4f8",
                      }} className="last:border-0">
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: "#e8f0f8", display: "flex", alignItems: "center", justifyContent: "center", color: "#155183",
                        }}>
                          <Clock size={13} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#0d2e47", margin: 0 }}>{s.name}</p>
                          <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
                            <CalendarDays size={9} />
                            {s.start_time
                              ? new Date(s.start_time).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
                              : new Date(s.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

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

              {/* Announcements */}
              <Section title={`Announcements · ${farm.announcements.length}`}>
                {farm.announcements.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#c5d5e4", textAlign: "center", padding: "16px 0", margin: 0 }}>No announcements</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {farm.announcements.map((a: Announcement) => (
                      <div key={String(a.id)} style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        padding: "9px 0", borderBottom: "1px solid #f0f4f8",
                      }} className="last:border-0">
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: "#e8f0f8", display: "flex", alignItems: "center", justifyContent: "center", color: "#155183",
                        }}>
                          <Megaphone size={13} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#0d2e47", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {a.title}
                          </p>
                          <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0 }}>
                            by {a.users_customuser?.username} · {new Date(a.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <StatusBadge status={a.status} />
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