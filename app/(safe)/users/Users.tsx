"use client"

import { useState } from "react"
import {
  Users, Search, CalendarDays,
  Fish, Megaphone, Layers, X,
  User, SlidersHorizontal
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

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-[#e8f0f8] text-[#155183]",
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = "sm" }: { user: User; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-[52px] h-[52px] text-lg" : "w-9 h-9 text-sm"
  return (
    <div
      className={`${dim} rounded-full shrink-0 border border-[#e2eaf2] flex items-center justify-center font-bold text-[#155183] bg-[#e8f0f8]`}
      style={
        user.profile_picture
          ? { backgroundImage: `url(${user.profile_picture})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      {!user.profile_picture && (user.first_name?.[0] || user.username[0])?.toUpperCase()}
    </div>
  )
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const cls = ROLE_COLORS[role] ?? "bg-[#f0f4f8] text-[#9ab0c4]"
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize whitespace-nowrap ${cls}`}>
      {role}
    </span>
  )
}

// ── Active badge ──────────────────────────────────────────────────────────────
function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
        active ? "bg-green-100 text-green-700" : "bg-red-50 text-red-500"
      }`}
    >
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
    {
      label: "Birthday",
      value: user.birthday
        ? new Date(user.birthday).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
        : "—",
    },
    {
      label: "Joined",
      value: new Date(user.date_joined).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
    },
    {
      label: "Last login",
      value: user.last_login
        ? new Date(user.last_login).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
        : "Never",
    },
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
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/20 z-[100]" />

      {/* Drawer: full-width on mobile, fixed 360px on sm+ */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[360px] bg-white z-[101] shadow-2xl flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#e8f0f8] to-[#c8ddf0] px-5 pt-7 pb-5 shrink-0 relative flex items-center gap-3.5">
          <Avatar user={user} size="lg" />
          <div className="flex-1 min-w-0 pr-8">
            <p className="text-base font-bold text-[#0d2e47] mb-1 truncate tracking-tight">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <RoleBadge role={user.role} />
              <ActiveBadge active={user.is_active} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/90 border-0 cursor-pointer text-[#155183] flex items-center justify-center hover:bg-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">

          {/* Stat tiles */}
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-2.5">
              Activity
            </p>
            <div className="grid grid-cols-2 gap-2">
              {statTiles.map((s) => (
                <div key={s.label} className="bg-[#f0f4f8] rounded-xl p-3 flex flex-col items-center gap-1">
                  <span className="text-[#155183]">{s.icon}</span>
                  <span className="text-xl font-bold text-[#0d2e47] leading-none">{s.value}</span>
                  <span className="text-[10px] text-[#9ab0c4] text-center">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info rows */}
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] mb-2.5">
              Details
            </p>
            {infoRows.map((row, i) => (
              <div
                key={row.label}
                className={`flex justify-between items-start gap-3 py-2 ${
                  i < infoRows.length - 1 ? "border-b border-[#f0f4f8]" : ""
                }`}
              >
                <span className="text-xs text-[#9ab0c4] shrink-0">{row.label}</span>
                <span className="text-xs font-semibold text-[#0d2e47] text-right break-words max-w-[55%]">
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
  const [showFilters, setShowFilters] = useState(false)

  const filtered: User[] = users.filter((u: User) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "all" || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex">
      <RegisterUserDialog open={registerOpen} onOpenChange={setRegisterOpen} />
      <Sidebar user={user} active="Users" />

      <main className="flex-1 lg:ml-56 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 mt-5">

        {/* Page header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#155183] opacity-60 mb-1">
              Management
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0d2e47] tracking-tight m-0">
              Users
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Role pills — sm and up */}
            <div className="hidden sm:flex gap-1.5">
              {["all", ...ROLES].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border-[1.5px] capitalize transition-all cursor-pointer ${
                    roleFilter === r
                      ? "border-[#155183] bg-[#155183] text-white"
                      : "border-[#e2eaf2] bg-white text-[#9ab0c4] hover:border-[#155183]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Filter icon button — mobile only */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`sm:hidden flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border-[1.5px] transition-all cursor-pointer ${
                roleFilter !== "all"
                  ? "border-[#155183] bg-[#155183] text-white"
                  : "border-[#e2eaf2] bg-white text-[#9ab0c4]"
              }`}
            >
              <SlidersHorizontal size={13} />
              Filter
            </button>

            {/* Register button */}
            <button
              onClick={() => setRegisterOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#155183] bg-white border-[1.5px] border-[#155183] rounded-lg px-3 py-2 cursor-pointer hover:bg-[#e8f0f8] transition-colors whitespace-nowrap"
            >
              <User size={13} />
              <span className="hidden sm:inline">Register User</span>
              <span className="sm:hidden">Register</span>
            </button>
          </div>
        </div>

        {/* Mobile filter pills (collapsible) */}
        {showFilters && (
          <div className="sm:hidden flex gap-2 mb-4 flex-wrap">
            {["all", ...ROLES].map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setShowFilters(false) }}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border-[1.5px] capitalize transition-all cursor-pointer ${
                  roleFilter === r
                    ? "border-[#155183] bg-[#155183] text-white"
                    : "border-[#e2eaf2] bg-white text-[#9ab0c4]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 bg-white border-[1.5px] border-[#e2eaf2] rounded-xl px-4 py-2.5 flex items-center gap-2.5">
            <Search size={14} className="text-[#9ab0c4] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username or email…"
              className="flex-1 border-none outline-none text-[13px] text-[#0d2e47] bg-transparent placeholder:text-[#c5d5e4] min-w-0"
            />
            <span className="text-[11px] font-semibold text-[#155183] bg-[#e8f0f8] px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
              {filtered.length} user{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-2.5">
              <Users size={28} className="text-[#155183] animate-pulse" />
              <p className="text-[13px] text-[#155183] opacity-50 m-0">Loading users…</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border-[1.5px] border-[#e2eaf2] rounded-2xl overflow-hidden">

            {/* Table header — desktop only */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] px-5 py-2.5 border-b-[1.5px] border-[#f0f4f8] bg-[#fafbfc]">
              {["User", "Role", "Joined"].map((h) => (
                <span key={h} className="text-[10px] font-semibold tracking-widest uppercase text-[#9ab0c4]">
                  {h}
                </span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[13px] text-[#c5d5e4] m-0">No users found</p>
              </div>
            ) : (
              filtered.map((u: User, idx) => (
                <div
                  key={String(u.id)}
                  onClick={() => setSelectedUser(u)}
                  className={`flex md:grid md:grid-cols-[2fr_1fr_1fr] items-center gap-3 px-4 md:px-5 py-3 cursor-pointer hover:bg-[#fafbfc] transition-colors ${
                    idx < filtered.length - 1 ? "border-b border-[#f0f4f8]" : ""
                  }`}
                >
                  {/* User info */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Avatar user={u} size="sm" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#0d2e47] m-0 truncate">
                        {u.first_name && u.last_name
                          ? `${u.first_name} ${u.last_name}`
                          : u.username}
                      </p>
                      <p className="text-[11px] text-[#9ab0c4] m-0 truncate">
                        @{u.username}
                        {/* Show email on sm+, role on mobile */}
                        <span className="hidden sm:inline"> · {u.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Role — desktop */}
                  <div className="hidden md:flex items-center">
                    <RoleBadge role={u.role} />
                  </div>

                  {/* Joined — desktop */}
                  <div className="hidden md:flex items-center">
                    <span className="text-[11px] text-[#9ab0c4] flex items-center gap-1">
                      <CalendarDays size={10} />
                      {new Date(u.date_joined).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Role badge — mobile only, pinned right */}
                  <div className="md:hidden ml-auto shrink-0">
                    <RoleBadge role={u.role} />
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