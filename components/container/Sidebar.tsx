"use client"

import { Fish, LayoutDashboard, Users, Megaphone, LogOut, Menu, X } from "lucide-react"
import { useLogoutMutation } from "@/store/authApi"
import { SessionUser } from "@/lib/session"
import { useState } from "react"

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={15} />, label: "Dashboard", href: "/dashboard" },
  { icon: <Fish size={15} />, label: "Farms", href: "/farms" },
  { icon: <Users size={15} />, label: "Users", href: "/users" },
  { icon: <Megaphone size={15} />, label: "Announcements", href: "/announcements" },
]

function SidebarContent({
  user,
  active,
  isPending,
  onClose,
  onLogout,
}: {
  user: SessionUser
  active?: string
  isPending: boolean
  onClose: () => void
  onLogout: () => void
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-7 h-7 rounded-lg bg-[#155183] flex items-center justify-center">
          <Fish size={14} className="text-white" />
        </div>
        <span className="text-[#155183] font-bold text-base tracking-tight">FiScan</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.label
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#155183]/10 text-[#155183] font-semibold"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-zinc-100 pt-4 mt-4">
        <div className="flex items-center gap-2.5 px-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#155183]/15 flex items-center justify-center text-[#155183] text-xs font-bold">
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-900 truncate">{user?.username}</p>
            <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          disabled={isPending}
          className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={14} />
          {isPending ? "Logging out..." : "Log Out"}
        </button>
      </div>
    </>
  )
}

export default function Sidebar({ user, active }: { user: SessionUser; active?: string }) {
  const { mutate: logout, isPending } = useLogoutMutation()
  const [open, setOpen] = useState(false)

  const sharedProps = {
    user,
    active,
    isPending,
    onClose: () => setOpen(false),
    onLogout: () => logout(),
  }

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#155183] flex items-center justify-center">
            <Fish size={14} className="text-white" />
          </div>
          <span className="text-[#155183] font-bold text-base tracking-tight">FiScan</span>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-50 transition-colors"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 z-50 bg-white border-r border-zinc-100 px-4 py-6 flex flex-col transform transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent {...sharedProps} />
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-zinc-100 px-4 py-6 fixed h-full z-40">
        <SidebarContent {...sharedProps} />
      </aside>
    </>
  )
}