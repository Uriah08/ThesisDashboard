"use client"

import { useState } from "react"
import {
  Users, Search, CalendarDays,
  Fish, Megaphone, Layers, X,
  User
} from "lucide-react"
import Sidebar from "@/components/container/Sidebar"
import { SessionUser } from "@/lib/session"
import { useUsersQuery } from "@/store/usersApi"
import RegisterUserDialog from "./_components/RegisterUserDialog"

// ── Types ─────────────────────────────────────────────────────────────────────
interface User {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  is_complete: boolean
  profile_picture?: string
  mobile_number: string
  address: string
  birthday?: string
  date_joined: string
  last_login?: string
  _count: {
    farms_farmmodel: number
    farms_farmmodel_members: number
    announcements_announcementmodel: number
    trays_sessiontraymodel: number
  }
}

const ROLES = ["admin"]

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin:      { bg: "#e8f0f8", color: "#155183" }
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }: { user: User; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: user.profile_picture ? `url(${user.profile_picture}) center/cover` : "#e8f0f8",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#155183",
      border: "1.5px solid #e2eaf2",
    }}>
      {!user.profile_picture && (user.first_name?.[0] || user.username[0])?.toUpperCase()}
    </div>
  )
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const c = ROLE_COLORS[role] ?? { bg: "#f0f4f8", color: "#9ab0c4" }
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
      background: c.bg, color: c.color, textTransform: "capitalize",
    }}>
      {role}
    </span>
  )
}

// ── Active badge ──────────────────────────────────────────────────────────────
function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
      background: active ? "#dcfce7" : "#fef2f2",
      color: active ? "#15803d" : "#ef4444",
    }}>
      {active ? "active" : "inactive"}
    </span>
  )
}

// ── User drawer ───────────────────────────────────────────────────────────────
function UserDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  const infoRows = [
    { label: "Username", value: user.username },
    { label: "Email", value: user.email },
    { label: "Mobile", value: user.mobile_number || "—" },
    { label: "Address", value: user.address || "—" },
    { label: "Birthday", value: user.birthday ? new Date(user.birthday).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "—" },
    { label: "Joined", value: new Date(user.date_joined).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) },
    { label: "Last login", value: user.last_login ? new Date(user.last_login).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "Never" },
    { label: "Status", value: user.is_active ? "Active" : "Inactive" },
    { label: "Profile complete", value: user.is_complete ? "Yes" : "No" },
    { label: "Staff", value: user.is_staff ? "Yes" : "No" },
    { label: "Superuser", value: user.is_superuser ? "Yes" : "No" },
  ]

  const statTiles = [
    { label: "Owned Farms", value: user._count.farms_farmmodel, icon: <Fish size={13} /> },
    { label: "Memberships", value: user._count.farms_farmmodel_members, icon: <Users size={13} /> },
    { label: "Tray Sessions", value: user._count.trays_sessiontraymodel, icon: <Layers size={13} /> },
    { label: "Announcements", value: user._count.announcements_announcementmodel, icon: <Megaphone size={13} /> },
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
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #e8f0f8 0%, #c8ddf0 100%)",
          padding: "28px 22px 20px", flexShrink: 0, position: "relative",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <Avatar user={user} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#0d2e47", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
              {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <RoleBadge role={user.role} />
              <ActiveBadge active={user.is_active} />
            </div>
          </div>
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

          {/* Stat tiles */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 10px" }}>
              Activity
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {statTiles.map(s => (
                <div key={s.label} style={{
                  background: "#f0f4f8", borderRadius: 10, padding: "12px 10px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                  <span style={{ color: "#155183" }}>{s.icon}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#0d2e47", lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: 10, color: "#9ab0c4", textAlign: "center" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info rows */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 10px" }}>
              Details
            </p>
            {infoRows.map(row => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                padding: "8px 0", borderBottom: "1px solid #f0f4f8",
              }} className="last:border-0">
                <span style={{ fontSize: 12, color: "#9ab0c4", flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0d2e47", textAlign: "right", maxWidth: 200 }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function UsersPage({ user }: { user: SessionUser }) {
  const { data: users = [], isLoading } = useUsersQuery()

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [registerOpen, setRegisterOpen] = useState(false)

  const filtered: User[] = users.filter((u: User) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "all" || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex" }}>
      <RegisterUserDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        // onSuccess={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
      />
      <Sidebar user={user} active="Users" />

      <main className="flex-1 lg:ml-56 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 mt-5">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", opacity: 0.6, margin: "0 0 4px" }}>
              Management
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d2e47", margin: 0, letterSpacing: "-0.02em" }}>
              Users
            </h1>
          </div>
          {/* Role filter pills */}
          <div className="hidden sm:flex" style={{ gap: 6, display: "flex" }}>
            {["all", ...ROLES].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 20,
                  border: "1.5px solid",
                  borderColor: roleFilter === r ? "#155183" : "#e2eaf2",
                  background: roleFilter === r ? "#155183" : "#fff",
                  color: roleFilter === r ? "#fff" : "#9ab0c4",
                  cursor: "pointer", textTransform: "capitalize", transition: "all .15s",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex justify-between items-center gap-5 mb-5">
          <div style={{
            background: "#fff", border: "1.5px solid #e2eaf2", borderRadius: 12,
            padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 10,
          }} className="flex-1">
            <Search size={14} color="#9ab0c4" style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, username or email…"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#0d2e47", background: "transparent" }}
            />
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#155183",
              background: "#e8f0f8", padding: "2px 10px", borderRadius: 20, flexShrink: 0,
            }}>
              {filtered.length} user{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
              onClick={() => setRegisterOpen(true)}
              className={`flex items-center gap-1.5 text-xs font-medium text-[#155183] bg-white border-[1.5px] border-[#155183] rounded-lg px-3.5 py-3 cursor-pointer transition-opacity`}
            >
              <User size={13} />
              Register User
            </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Users size={28} color="#155183" className="animate-pulse" />
              <p style={{ fontSize: 13, color: "#155183", opacity: 0.5, margin: 0 }}>Loading users…</p>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1.5px solid #e2eaf2", borderRadius: 14, overflow: "hidden" }}>
            {/* Table header */}
            <div
              className="hidden md:grid"
              style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
                padding: "10px 20px", borderBottom: "1.5px solid #f0f4f8",
                background: "#fafbfc",
              }}
            >
              {["User", "Role", "Joined"].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9ab0c4" }}>
                  {h}
                </span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#c5d5e4", margin: 0 }}>No users found</p>
              </div>
            ) : (
              filtered.map((u: User) => (
                <div
                  key={String(u.id)}
                  onClick={() => setSelectedUser(u)}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr]"
                  style={{
                    padding: "12px 20px", borderBottom: "1px solid #f0f4f8",
                    cursor: "pointer", transition: "background .1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  {/* User info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar user={u} size={34} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0d2e47", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.username}
                      </p>
                      <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        @{u.username} · {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center"><RoleBadge role={u.role} /></div>
                  <div className="hidden md:flex items-center">
                    <span style={{ fontSize: 11, color: "#9ab0c4", display: "flex", alignItems: "center", gap: 4 }}>
                      <CalendarDays size={10} />
                      {new Date(u.date_joined).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {selectedUser && (
        <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  )
}