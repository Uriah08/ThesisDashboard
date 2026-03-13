"use client"

import { useState } from "react"
import {
  Megaphone, Search, Plus, X, CalendarDays, Users, Clock
} from "lucide-react"
import Sidebar from "@/components/container/Sidebar"
import { SessionUser } from "@/lib/session"
import { useAnnouncementsQuery, useCreateAnnouncementMutation } from "@/store/announcementApi"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ── Types ─────────────────────────────────────────────────────────────────────
interface Announcement {
  id: string
  title: string
  content: string
  status: string
  created_at: string
  expires_at?: string
  users_customuser?: { id: string; username: string; profile_picture?: string }
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

// ── Announcement drawer ───────────────────────────────────────────────────────
function AnnouncementDrawer({ announcement, onClose }: { announcement: Announcement; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)", zIndex: 100 }} />
      <div style={{
        position: "fixed", top: 0, right: 0, height: "100%", width: 400,
        background: "#fff", zIndex: 101,
        boxShadow: "-4px 0 32px rgba(21,81,131,0.10)",
        display: "flex", flexDirection: "column", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #e8f0f8 0%, #c8ddf0 100%)",
          padding: "28px 22px 20px", flexShrink: 0, position: "relative",
        }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <StatusBadge status={announcement.status} />
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0d2e47", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.4 }}>
            {announcement.title}
          </h2>
        </div>

        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Content */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 10px" }}>
              Content
            </p>
            <p style={{
              fontSize: 13, color: "#0d2e47", lineHeight: 1.7, margin: 0,
              background: "#f0f4f8", borderRadius: 10, padding: "14px 16px",
            }}>
              {announcement.content}
            </p>
          </div>

          {/* Details */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 10px" }}>
              Details
            </p>
            {[
                { label: "Posted by", value: announcement.users_customuser?.username ?? "—", icon: <Users size={11} /> },
              { label: "Created", value: new Date(announcement.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }), icon: <CalendarDays size={11} /> },
              { label: "Expires", value: announcement.expires_at ? new Date(announcement.expires_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "No expiry", icon: <Clock size={11} /> },
            ].map(row => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 0", borderBottom: "1px solid #f0f4f8",
              }} className="last:border-0">
                <span style={{ fontSize: 12, color: "#9ab0c4", display: "flex", alignItems: "center", gap: 5 }}>
                  {row.icon} {row.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0d2e47" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Create modal ──────────────────────────────────────────────────────────────
function CreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
const { mutate: createAnnouncement, isPending } = useCreateAnnouncementMutation()

  const [form, setForm] = useState({
    title: "",
    content: "",
    status: "active" as "active" | "inactive",
    expires_at: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: "" }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Title is required"
    if (!form.content.trim()) e.content = "Content is required"
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    createAnnouncement(
      { title: form.title, content: form.content, status: form.status, expires_at: form.expires_at || undefined },
      {
        onSuccess: () => {
          setForm({ title: "", content: "", status: "active", expires_at: "" })
          setErrors({})
          onClose()
        },
      }
    )
  }

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: "100%", padding: "9px 12px", fontSize: 13,
    border: `1.5px solid ${err ? "#fca5a5" : "#e2eaf2"}`,
    borderRadius: 9, outline: "none", color: "#0d2e47",
    background: "#fff", boxSizing: "border-box",
  })

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, letterSpacing: "0.07em",
    textTransform: "uppercase", color: "#155183", display: "block", marginBottom: 6,
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent style={{ maxWidth: 480, padding: 0, borderRadius: 16, overflow: "hidden" }}>
        <DialogHeader style={{ padding: "18px 22px", borderBottom: "1.5px solid #f0f4f8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: "#e8f0f8",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#155183",
            }}>
              <Megaphone size={14} />
            </div>
            <div>
              <DialogTitle style={{ fontSize: 14, fontWeight: 700, color: "#0d2e47", margin: 0 }}>
                New Announcement
              </DialogTitle>
              <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0 }}>Fill in the details below</p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title</label>
            <input
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. Feeding schedule updated"
              style={inputStyle(errors.title)}
            />
            {errors.title && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0" }}>{errors.title}</p>}
          </div>

          {/* Content */}
          <div>
            <label style={labelStyle}>Content</label>
            <textarea
              value={form.content}
              onChange={e => set("content", e.target.value)}
              placeholder="Write your announcement here…"
              rows={4}
              style={{ ...inputStyle(errors.content), resize: "vertical", lineHeight: 1.6 }}
            />
            {errors.content && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0" }}>{errors.content}</p>}
          </div>


          {/* Status + Expires row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={e => set("status", e.target.value)}
                style={inputStyle()}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                Expires at <span style={{ opacity: 0.5, textTransform: "none", fontSize: 10 }}>(optional)</span>
              </label>
              <input
                type="date"
                value={form.expires_at}
                onChange={e => set("expires_at", e.target.value)}
                style={inputStyle()}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", gap: 10, padding: "16px 22px",
          borderTop: "1.5px solid #f0f4f8",
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "10px", borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: "#f0f4f8", border: "none", color: "#9ab0c4", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              flex: 2, padding: "10px", borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: "#155183", border: "none", color: "#fff",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1, transition: "opacity .15s",
            }}
          >
            {isPending ? "Posting…" : "Post Announcement"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnnouncementsPage({ user }: { user: SessionUser }) {
  const { data: announcements = [], isLoading } = useAnnouncementsQuery()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected, setSelected] = useState<Announcement | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const filtered: Announcement[] = announcements.filter((a: Announcement) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
a.users_customuser?.username.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || a.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex" }}>
      <Sidebar user={user} active="Announcements" />

      <main className="flex-1 lg:ml-56 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 mt-5">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", opacity: 0.6, margin: "0 0 4px" }}>
              Management
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0d2e47", margin: 0, letterSpacing: "-0.02em" }}>
              Announcements
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 600, color: "#fff",
              background: "#155183", border: "none",
              borderRadius: 8, padding: "8px 16px", cursor: "pointer",
            }}
          >
            <Plus size={14} /> New Announcement
          </button>
        </div>

        {/* Search + filter */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{
            flex: 1, background: "#fff", border: "1.5px solid #e2eaf2", borderRadius: 12,
            padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
          }}>
            <Search size={14} color="#9ab0c4" style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search title, farm or author…"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#0d2e47", background: "transparent" }}
            />
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#155183",
              background: "#e8f0f8", padding: "2px 10px", borderRadius: 20, flexShrink: 0,
            }}>
              {filtered.length}
            </span>
          </div>
          {/* Status filter */}
          {["all", "active", "inactive"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                fontSize: 11, fontWeight: 600, padding: "5px 14px", borderRadius: 20,
                border: "1.5px solid",
                borderColor: statusFilter === s ? "#155183" : "#e2eaf2",
                background: statusFilter === s ? "#155183" : "#fff",
                color: statusFilter === s ? "#fff" : "#9ab0c4",
                cursor: "pointer", textTransform: "capitalize", transition: "all .15s",
                flexShrink: 0,
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Megaphone size={28} color="#155183" className="animate-pulse" />
              <p style={{ fontSize: 13, color: "#155183", opacity: 0.5, margin: 0 }}>Loading announcements…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: "#fff", border: "1.5px solid #e2eaf2", borderRadius: 14,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "60px 20px", gap: 10,
          }}>
            <Megaphone size={32} color="#155183" opacity={0.2} />
            <p style={{ fontSize: 14, color: "#9ab0c4", margin: 0 }}>
              {search ? "No announcements match your search" : "No announcements yet"}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  fontSize: 12, fontWeight: 600, color: "#155183",
                  background: "#e8f0f8", border: "none", borderRadius: 8,
                  padding: "7px 16px", cursor: "pointer", marginTop: 4,
                }}
              >
                Post your first announcement
              </button>
            )}
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1.5px solid #e2eaf2", borderRadius: 14, overflow: "hidden" }}>
            {/* Table header */}
            <div
              className="hidden md:grid"
              style={{
                display: "grid", gridTemplateColumns: "3fr 1fr 1fr",
                padding: "10px 20px", borderBottom: "1.5px solid #f0f4f8",
                background: "#fafbfc",
              }}
            >
              {["Announcement", "Posted by", "Date"].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9ab0c4" }}>
                  {h}
                </span>
              ))}
            </div>

            {filtered.map((a: Announcement) => (
              <div
                key={String(a.id)}
                onClick={() => setSelected(a)}
                className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr]"
                style={{
                  padding: "13px 20px", borderBottom: "1px solid #f0f4f8",
                  cursor: "pointer", transition: "background .1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                {/* Title + status */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: a.status === "active" ? "#22c55e" : "#c5d5e4",
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0d2e47", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.title}
                    </p>
                    <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.content}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center">
                  <span style={{ fontSize: 11, color: "#9ab0c4" }}>
                    {a.users_customuser?.username ?? "—"}
                  </span>
                </div>

                <div className="hidden md:flex items-center">
                  <span style={{ fontSize: 11, color: "#9ab0c4", display: "flex", alignItems: "center", gap: 4 }}>
                    <CalendarDays size={10} />
                    {new Date(a.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && <AnnouncementDrawer announcement={selected} onClose={() => setSelected(null)} />}
      <CreateModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}