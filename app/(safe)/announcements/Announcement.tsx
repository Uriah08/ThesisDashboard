"use client"

import { useState } from "react"
import {
  Megaphone, Search, Plus, X, CalendarDays, Clock, Users, ChevronDown, Check
} from "lucide-react"
import Sidebar from "@/components/container/Sidebar"
import { SessionUser } from "@/lib/session"
import { useAnnouncementsQuery, useCreateAnnouncementMutation } from "@/store/announcementApi"
import { useQuery } from "@tanstack/react-query"
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
  body: string
  data: {
    created_by: string
    expires_at?: string | null
    farm_ids?: string[] | null
  }
  created_at: string
  updated_at: string
  users_customuser: {
    username: string
  }
}

interface Farm {
  id: string
  name: string
}

// ── Farm hooks ────────────────────────────────────────────────────────────────
function useFarmsQuery() {
  return useQuery<Farm[]>({
    queryKey: ["farms-list"],
    queryFn: async () => {
      const res = await fetch("/api/farms")
      if (!res.ok) throw new Error("Failed to fetch farms")
      return res.json()
    },
  })
}

// ── Farm multi-select ─────────────────────────────────────────────────────────
function FarmMultiSelect({
  farms,
  selected,
  onChange,
}: {
  farms: Farm[]
  selected: string[] // empty = "All farms"
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)

  const toggleFarm = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const label =
    selected.length === 0
      ? "All farms"
      : selected.length === farms.length
      ? "All farms (selected)"
      : selected.length === 1
      ? farms.find(f => f.id === selected[0])?.name ?? "1 farm"
      : `${selected.length} farms selected`

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "9px 12px", fontSize: 13, border: "1.5px solid #e2eaf2",
          borderRadius: 9, outline: "none", color: selected.length === 0 ? "#9ab0c4" : "#0d2e47",
          background: "#fff", cursor: "pointer", boxSizing: "border-box",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Users size={13} color="#155183" />
          {label}
        </span>
        <ChevronDown
          size={13}
          color="#9ab0c4"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
            background: "#fff", border: "1.5px solid #e2eaf2", borderRadius: 10,
            boxShadow: "0 8px 24px rgba(21,81,131,0.10)", zIndex: 11,
            overflow: "hidden", maxHeight: 220, overflowY: "auto",
          }}>
            {/* All farms option */}
            <button
              type="button"
              onClick={() => { onChange([]); setOpen(false) }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", border: "none", background: selected.length === 0 ? "#e8f0f8" : "transparent",
                cursor: "pointer", fontSize: 13, color: "#0d2e47", borderBottom: "1px solid #f0f4f8",
              }}
            >
              <span style={{ fontWeight: 600 }}>All farms</span>
              {selected.length === 0 && <Check size={13} color="#155183" />}
            </button>

            {farms.map(farm => {
              const checked = selected.includes(farm.id)
              return (
                <button
                  key={farm.id}
                  type="button"
                  onClick={() => toggleFarm(farm.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", border: "none",
                    background: checked ? "#f0f6ff" : "transparent",
                    cursor: "pointer", fontSize: 13, color: "#0d2e47",
                    borderBottom: "1px solid #f0f4f8",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Checkbox */}
                    <span style={{
                      width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${checked ? "#155183" : "#c8d8e8"}`,
                      background: checked ? "#155183" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {checked && <Check size={9} color="#fff" strokeWidth={3} />}
                    </span>
                    {farm.name}
                  </span>
                </button>
              )
            })}

            {farms.length === 0 && (
              <p style={{ fontSize: 12, color: "#9ab0c4", padding: "12px 14px", margin: 0 }}>
                No farms available
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Announcement drawer ───────────────────────────────────────────────────────
function AnnouncementDrawer({
  announcement,
  farms,
  onClose,
}: {
  announcement: Announcement
  farms: Farm[]
  onClose: () => void
}) {
  const farmIds = announcement.data?.farm_ids
  const targetLabel =
    !farmIds || farmIds.length === 0
      ? "All farms"
      : farmIds
          .map(id => farms.find(f => f.id === id)?.name ?? `Farm #${id}`)
          .join(", ")

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
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0d2e47", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.4 }}>
            {announcement.title}
          </h2>
        </div>

        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Body */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 10px" }}>
              Message
            </p>
            <p style={{
              fontSize: 13, color: "#0d2e47", lineHeight: 1.7, margin: 0,
              background: "#f0f4f8", borderRadius: 10, padding: "14px 16px",
            }}>
              {announcement.body}
            </p>
          </div>

          {/* Details */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155183", margin: "0 0 10px" }}>
              Details
            </p>
            {[
              {
                label: "Sent to",
                value: targetLabel,
                icon: <Users size={11} />,
              },
              {
                label: "Sent",
                value: new Date(announcement.created_at).toLocaleDateString("en-PH", {
                  year: "numeric", month: "long", day: "numeric",
                }),
                icon: <CalendarDays size={11} />,
              },
              {
                label: "Expires",
                value: announcement.data?.expires_at
                  ? new Date(announcement.data.expires_at).toLocaleDateString("en-PH", {
                      year: "numeric", month: "long", day: "numeric",
                    })
                  : "No expiry",
                icon: <Clock size={11} />,
              },
            ].map(row => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                padding: "9px 0", borderBottom: "1px solid #f0f4f8",
              }}>
                <span style={{ fontSize: 12, color: "#9ab0c4", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  {row.icon} {row.label}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: "#0d2e47",
                  textAlign: "right", maxWidth: "60%",
                }}>
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

// ── Create modal ──────────────────────────────────────────────────────────────
function CreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate: createAnnouncement, isPending } = useCreateAnnouncementMutation()
  const { data: farms = [] } = useFarmsQuery()

  const [form, setForm] = useState({
    title: "",
    body: "",
    expires_at: "",
    farm_ids: [] as string[], // empty = all farms
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: "" }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Title is required"
    if (!form.body.trim()) e.body = "Body is required"
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    createAnnouncement(
      {
        title: form.title,
        body: form.body,
        expires_at: form.expires_at || undefined,
        farm_ids: form.farm_ids.length > 0 ? form.farm_ids : undefined,
      },
      {
        onSuccess: () => {
          setForm({ title: "", body: "", expires_at: "", farm_ids: [] })
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

  // Recipient summary pill
  const recipientHint =
    form.farm_ids.length === 0
      ? "All active users will be notified"
      : form.farm_ids.length === 1
      ? `Members of "${farms.find(f => f.id === form.farm_ids[0])?.name}" will be notified`
      : `Members of ${form.farm_ids.length} farms will be notified`

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
              placeholder="e.g. Scheduled maintenance on Aug 30th"
              style={inputStyle(errors.title)}
            />
            {errors.title && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0" }}>{errors.title}</p>}
          </div>

          {/* Body */}
          <div>
            <label style={labelStyle}>Body</label>
            <textarea
              value={form.body}
              onChange={e => set("body", e.target.value)}
              placeholder="Write your announcement here…"
              rows={4}
              style={{ ...inputStyle(errors.body), resize: "vertical", lineHeight: 1.6 }}
            />
            {errors.body && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0" }}>{errors.body}</p>}
          </div>

          {/* Farm selection */}
          <div>
            <label style={labelStyle}>
              Send to{" "}
              <span style={{ opacity: 0.5, textTransform: "none", fontSize: 10 }}>(optional)</span>
            </label>
            <FarmMultiSelect
              farms={farms}
              selected={form.farm_ids}
              onChange={ids => setForm(prev => ({ ...prev, farm_ids: ids }))}
            />
            {/* Recipient hint */}
            <p style={{
              fontSize: 11, color: "#155183", margin: "6px 0 0",
              background: "#e8f0f8", borderRadius: 6, padding: "5px 10px",
              display: "inline-block",
            }}>
              {recipientHint}
            </p>
          </div>

          {/* Expires */}
          <div>
            <label style={labelStyle}>
              Expires at{" "}
              <span style={{ opacity: 0.5, textTransform: "none", fontSize: 10 }}>(optional)</span>
            </label>
            <input
              type="date"
              value={form.expires_at}
              onChange={e => set("expires_at", e.target.value)}
              style={inputStyle()}
            />
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
  const { data: farms = [] } = useFarmsQuery()

  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Announcement | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const filtered: Announcement[] = announcements.filter((a: Announcement) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.users_customuser?.username.toLowerCase().includes(search.toLowerCase())
    return matchSearch
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

        {/* Search */}
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
                display: "grid", gridTemplateColumns: "3fr 1.4fr 1fr",
                padding: "10px 20px", borderBottom: "1.5px solid #f0f4f8",
                background: "#fafbfc",
              }}
            >
              {["Announcement", "Sent to", "Date"].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9ab0c4" }}>
                  {h}
                </span>
              ))}
            </div>

            {filtered.map((a: Announcement) => {
              const farmIds = a.data?.farm_ids
              const targetLabel =
                !farmIds || farmIds.length === 0
                  ? "All farms"
                  : farmIds.length === 1
                  ? farms.find(f => f.id === farmIds[0])?.name ?? "1 farm"
                  : `${farmIds.length} farms`

              return (
                <div
                  key={String(a.id)}
                  onClick={() => setSelected(a)}
                  className="grid grid-cols-1 md:grid-cols-[3fr_1.4fr_1fr]"
                  style={{
                    padding: "13px 20px", borderBottom: "1px solid #f0f4f8",
                    cursor: "pointer", transition: "background .1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  {/* Title + body preview */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: "#155183", opacity: 0.4,
                    }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0d2e47", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.title}
                      </p>
                      <p style={{ fontSize: 11, color: "#9ab0c4", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.body}
                      </p>
                    </div>
                  </div>

                  {/* Farm target */}
                  <div className="hidden md:flex items-center">
                    <span style={{
                      fontSize: 11, color: "#155183", fontWeight: 600,
                      background: "#e8f0f8", padding: "3px 9px", borderRadius: 20,
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <Users size={10} />
                      {targetLabel}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="hidden md:flex items-center">
                    <span style={{ fontSize: 11, color: "#9ab0c4", display: "flex", alignItems: "center", gap: 4 }}>
                      <CalendarDays size={10} />
                      {new Date(a.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {selected && (
        <AnnouncementDrawer
          announcement={selected}
          farms={farms}
          onClose={() => setSelected(null)}
        />
      )}
      <CreateModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}