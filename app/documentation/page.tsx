/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

type NavChild = { id: string; label: string }
type NavItem = { id: string; label: string; children: NavChild[] }

type SearchResult = { id: string; label: string; section: string; excerpt: string }

const SEARCH_INDEX: SearchResult[] = [
  { id: "create-account",   section: "Getting Started",           label: "Create an Account",              excerpt: "Open the app and tap Register. Enter your username, email, and create a password." },
  { id: "login",            section: "Getting Started",           label: "Logging In",                     excerpt: "Tap Log In, enter your registered email and password, then press Login." },
  { id: "complete-profile", section: "Getting Started",           label: "Complete Your Profile",          excerpt: "Fill in your full name, birthdate, mobile number, and other farmer details." },
  { id: "dashboard",        section: "Navigating the App",        label: "Dashboard",                      excerpt: "Main hub with weather forecast, drying recommendations, and weather charts." },
  { id: "weather-icons",    section: "Navigating the App",        label: "Weather Icons Guide",            excerpt: "Clear Sky, Few Clouds, Scattered Clouds, Broken Clouds, Shower Rain, Rain, Thunderstorm." },
  { id: "weather-alerts",   section: "Navigating the App",        label: "Weather Alerts for Drying Fish", excerpt: "Alerts based on rain probability and cloud coverage: Excellent, Good, Caution, Warning, Danger." },
  { id: "drying",           section: "Navigating the App",        label: "Drying",                         excerpt: "Monitor and track your sun-dried fish drying process. View ongoing batches and progress." },
  { id: "scan-nav",         section: "Navigating the App",        label: "Scan",                           excerpt: "Capture images of your tuyo to analyze quality, detect defects, and get instant results." },
  { id: "notifications",    section: "Navigating the App",        label: "Notifications",                  excerpt: "Weather notifications up to two days in advance, timed to your scheduled drying activities." },
  { id: "settings-nav",     section: "Navigating the App",        label: "Settings",                       excerpt: "Manage your profile, change password, access FAQ, Help Center, Terms of Service, and About." },
  { id: "admin-role",       section: "Roles & Permissions",       label: "Admin",                          excerpt: "Creates a drying area, full control: edit info, create and delete trays, manage timelines." },
  { id: "member-role",      section: "Roles & Permissions",       label: "Member",                         excerpt: "Limited access, can only use trays created by admin. Can create timelines and harvest batches." },
  { id: "scan-methods",     section: "Scan Methods & Guidelines", label: "How to Scan",                    excerpt: "Access from main hub or inside a tray. Fish must be flat, camera no more than 30 cm away." },
  { id: "classification",   section: "Scan Methods & Guidelines", label: "Fish Classification",            excerpt: "Scan results: Reject (spoilage or defects), Undried (needs more drying), Dry (ready to store)." },
]

const NAV: NavItem[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    children: [
      { id: "create-account", label: "Create an Account" },
      { id: "login", label: "Logging In" },
      { id: "complete-profile", label: "Complete Your Profile" },
    ],
  },
  {
    id: "navigating",
    label: "Navigating the App",
    children: [
      { id: "dashboard", label: "Dashboard" },
      { id: "weather-icons", label: "Weather Icons Guide" },
      { id: "weather-alerts", label: "Weather Alerts" },
      { id: "drying", label: "Drying" },
      { id: "scan-nav", label: "Scan" },
      { id: "notifications", label: "Notifications" },
      { id: "settings-nav", label: "Settings" },
    ],
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    children: [
      { id: "admin-role", label: "Admin" },
      { id: "member-role", label: "Member" },
    ],
  },
  {
    id: "scan-guide",
    label: "Scan Methods & Guidelines",
    children: [
      { id: "scan-methods", label: "How to Scan" },
      { id: "classification", label: "Fish Classification" },
    ],
  },
]

// ── Shared components ──────────────────────────────────────────────────────

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-20 text-xl font-semibold text-[#0d2e47] mt-10 mb-3 pb-2 border-b border-slate-100">
      {children}
    </h2>
  )
}

function SubHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-20 text-[15px] font-semibold text-[#0d2e47] mt-6 mb-2">
      {children}
    </h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-600 leading-relaxed mb-2">{children}</p>
}

function Hi({ children }: { children: React.ReactNode }) {
  return <span className="text-[#155183] font-medium">{children}</span>
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-[#c0d8ef] bg-[#e8f0f8] px-4 py-3 text-sm text-[#155183] leading-relaxed">
      {children}
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#e8f0f8] text-[#155183] text-[11px] font-medium px-2 py-0.5 border border-[#c0d8ef]">
      {children}
    </span>
  )
}

function StepCard({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="shrink-0 w-6 h-6 rounded-full bg-[#155183] text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#0d2e47] mb-0.5">{title}</p>
        <div className="text-sm text-slate-600 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

// ── Tables ─────────────────────────────────────────────────────────────────

const ALERTS = [
  { rain: "0%",         cloud: "Below 50%",  label: "Excellent", color: "#16a34a" },
  { rain: "0%",         cloud: "50%–100%",   label: "Good",      color: "#2563eb" },
  { rain: "1%–80%",     cloud: "Up to 100%", label: "Caution",   color: "#ca8a04" },
  { rain: "81%–98%",    cloud: "Any",        label: "Warning",   color: "#ea580c" },
  { rain: "99%–100%",   cloud: "Any",        label: "Danger",    color: "#dc2626" },
]

function AlertTable() {
  return (
    <div className="my-4 border border-slate-200 rounded-lg overflow-hidden text-sm">
      <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
        {["Rain %", "Cloud %", "Alert"].map((h) => (
          <span key={h} className="px-4 py-2.5 font-semibold text-slate-700">{h}</span>
        ))}
      </div>
      {ALERTS.map((r) => (
        <div key={r.label} className="grid grid-cols-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
          <span className="px-4 py-2.5 text-slate-600">{r.rain}</span>
          <span className="px-4 py-2.5 text-slate-600">{r.cloud}</span>
          <span className="px-4 py-2.5 font-semibold" style={{ color: r.color }}>{r.label}</span>
        </div>
      ))}
    </div>
  )
}

const CLASSIFICATIONS = [
  { status: "Reject",  color: "#961515", desc: "Not suitable due to spoilage or defects." },
  { status: "Undried", color: "#c47f00", desc: "Still moist and needs more drying time." },
  { status: "Dry",     color: "#127312", desc: "Fully dried and ready for storage or selling." },
]

function ClassificationTable() {
  return (
    <div className="my-4 border border-slate-200 rounded-lg overflow-hidden text-sm">
      <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200">
        {["Status", "Description"].map((h) => (
          <span key={h} className="px-4 py-2.5 font-semibold text-slate-700">{h}</span>
        ))}
      </div>
      {CLASSIFICATIONS.map((r) => (
        <div key={r.status} className="grid grid-cols-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
          <span className="px-4 py-2.5 font-semibold" style={{ color: r.color }}>{r.status}</span>
          <span className="px-4 py-2.5 text-slate-600">{r.desc}</span>
        </div>
      ))}
    </div>
  )
}

const WEATHER_ICONS = [
  { emoji: "☀️",  label: "Clear Sky",        desc: "Ideal drying conditions with strong sunlight and clear skies." },
  { emoji: "🌤",  label: "Few Clouds",        desc: "Mostly sunny with minimal cloud cover. Drying is still recommended." },
  { emoji: "⛅",  label: "Scattered Clouds",  desc: "Partial cloud coverage. Drying may take longer but remains possible." },
  { emoji: "🌥",  label: "Broken Clouds",     desc: "Cloudy skies with limited sunlight. Drying efficiency may be reduced." },
  { emoji: "🌦",  label: "Shower Rain",       desc: "Light or intermittent rain. Sun-drying is not recommended." },
  { emoji: "🌧",  label: "Rain",              desc: "Continuous rainfall. Drying is unsafe and ineffective." },
  { emoji: "⛈",  label: "Thunderstorm",      desc: "Severe weather with heavy rain and thunderstorm. Drying should be avoided." },
]

function WeatherIconList() {
  return (
    <div className="my-4 border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
      {WEATHER_ICONS.map((w) => (
        <div key={w.label} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
          <span className="text-xl shrink-0 mt-0.5">{w.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-[#0d2e47]">{w.label}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{w.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function RoleCard({ id, title, badge, children }: { id: string; title: string; badge: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20 border border-slate-200 rounded-lg p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-[#0d2e47]">{title}</span>
        <Badge>{badge}</Badge>
      </div>
      <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

function SearchModal({ onClose, onSelect }: { onClose: () => void; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("")
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = query.trim().length === 0
    ? SEARCH_INDEX
    : SEARCH_INDEX.filter(({ label, section, excerpt }) => {
        const q = query.toLowerCase()
        return label.toLowerCase().includes(q) || section.toLowerCase().includes(q) || excerpt.toLowerCase().includes(q)
      })

  useEffect(() => { inputRef.current?.focus() }, [])
   
  useEffect(() => { setHighlighted(0) }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown")  { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, results.length - 1)) }
      else if (e.key === "ArrowUp")   { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)) }
      else if (e.key === "Enter")     { if (results[highlighted]) onSelect(results[highlighted].id) }
      else if (e.key === "Escape")    { onClose() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [results, highlighted, onSelect, onClose])

  function highlight(text: string) {
    if (!query.trim()) return <>{text}</>
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase()
            ? <mark key={i} className="bg-[#c0d8ef] text-[#155183] rounded-sm px-0.5 font-medium not-italic">{part}</mark>
            : part
        )}
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <span className="text-slate-400 text-sm">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="flex-1 text-sm text-[#0d2e47] placeholder-slate-400 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Clear</button>
          )}
          <kbd className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 rounded px-1.5 py-0.5 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No results for &ldquo;<span className="text-slate-600">{query}</span>&rdquo;
            </div>
          ) : (
            <ul>
              {results.map((item, i) => (
                <li key={item.id}>
                  <button
                    onClick={() => onSelect(item.id)}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 transition-colors ${highlighted === i ? "bg-[#e8f0f8]" : "hover:bg-slate-50"}`}
                  >
                    <span className="text-[10px] font-medium text-[#155183] bg-[#e8f0f8] border border-[#c0d8ef] px-1.5 py-0.5 rounded mb-1 inline-block">
                      {item.section}
                    </span>
                    <p className="text-sm font-semibold text-[#0d2e47]">{highlight(item.label)}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-1">{highlight(item.excerpt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-400">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">ESC</kbd> close</span>
          <span className="ml-auto">{results.length} result{results.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  )
}

export default function Documentation() {
  const [activeId, setActiveId] = useState("create-account")
  const [open, setOpen] = useState<Record<string, boolean>>({
    "getting-started": true,
    navigating: true,
    roles: true,
    "scan-guide": true,
  })

  const scrollTo = (id: string) => {
  setActiveId(id)
  setSearchOpen(false)
  setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, 50)
}

const router = useRouter()

const [searchOpen, setSearchOpen] = useState(false)

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setSearchOpen((v) => !v)
    }
  }
  window.addEventListener("keydown", handler)
  return () => window.removeEventListener("keydown", handler)
}, [])
// ← nothing after this, the duplicate scrollTo is gone

  return (
    <div className="min-h-screen bg-white text-[#0d2e47]">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-slate-200 bg-white/95 backdrop-blur-sm flex items-center px-6 gap-4">
        <div className="flex items-center gap-2.5">
          <Image onClick={() => router.push('/')} src="/icon.png" alt="FiScan" width={50} height={50} className="w-17.5 h-8 cursor-pointer"/>
          <span className="text-[11px] font-medium bg-[#e8f0f8] text-[#155183] px-2 py-0.5 rounded-full border border-[#c0d8ef]">
            Docs
          </span>
        </div>
        <div className="flex-1" />
        {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} onSelect={scrollTo} />}
        <div
        onClick={() => setSearchOpen(true)}
        className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-400 cursor-pointer hover:border-[#155183] transition-colors select-none"
        >
        <span>🔍</span>
        <span>Search docs...</span>
        </div>
      </header>

      <div className="flex pt-14">

        {/* ── Left Sidebar ── */}
        <aside className="hidden md:block fixed top-14 left-0 bottom-0 w-60 border-r border-slate-200 bg-white overflow-y-auto py-6 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-3">
            Documentation
          </p>

          {NAV.map((section) => (
            <div key={section.id} className="mb-1">
              <button
                onClick={() => setOpen((p) => ({ ...p, [section.id]: !p[section.id] }))}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span>{section.label}</span>
                <span className={`text-[9px] text-slate-400 transition-transform duration-200 ${open[section.id] ? "rotate-90" : ""}`}>
                  ▶
                </span>
              </button>

              {open[section.id] && (
                <div className="mt-0.5 ml-3 pl-3 border-l border-slate-200 flex flex-col gap-0.5">
                  {section.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => scrollTo(child.id)}
                      className={`text-left text-[13px] px-2 py-1 rounded-md transition-colors ${
                        activeId === child.id
                          ? "bg-[#e8f0f8] text-[#155183] font-medium"
                          : "text-slate-500 hover:text-[#155183] hover:bg-slate-50"
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 md:ml-60 xl:mr-52 min-w-0">
          <div className="max-w-3xl mx-auto px-6 py-10 pb-24">

            {/* Page title */}
            <div className="mb-10 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                <span>Docs</span>
                <span>/</span>
                <span className="text-[#155183]">Help Center</span>
              </div>
              <h1 className="text-3xl font-bold text-[#0d2e47] tracking-tight mb-3">
                Help Center
              </h1>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                Complete guide for using TuyoApp — from account setup to scanning your sun-dried fish.
              </p>
              <div className="flex gap-2 mt-4 flex-wrap">
                <Badge>v1.0</Badge>
                <Badge>Mobile App</Badge>
                <Badge>Tuyo Farming</Badge>
              </div>
            </div>

            {/* ── Getting Started ── */}
            <SectionHeading id="getting-started">Getting Started</SectionHeading>
            <P>Follow these steps to create your account and start using TuyoApp.</P>

            <SubHeading id="create-account">1. Create an Account</SubHeading>
            <StepCard number={1} title="Open the app and tap Register">
              Enter your <Hi>username</Hi>, <Hi>email</Hi>, and create a <Hi>password</Hi>.
            </StepCard>
            <StepCard number={2} title="Follow the complete profile steps">
              Fill out all required personal information to complete registration.
            </StepCard>
            <StepCard number={3} title="Success confirmation">
              A success message will appear once your registration is complete before proceeding to the app.
            </StepCard>

            <SubHeading id="login">2. Logging In</SubHeading>
            <P>
              Tap <Hi>Log In</Hi>, enter your registered email and password, then press <Hi>Login</Hi>.
            </P>
            <P>
              You&apos;ll see a confirmation message when login is successful before being redirected to complete your profile.
            </P>

            <SubHeading id="complete-profile">3. Complete Your Profile</SubHeading>
            <P>
              After your first login, you&apos;ll be directed to the <Hi>Complete Profile</Hi> page. Fill in all required information including your full name, birthdate, mobile number, and other farmer details.
            </P>
            <Callout>
              ✅ Once completed, you&apos;ll be redirected to the dashboard and can start using the app.
            </Callout>

            {/* ── Navigating ── */}
            <SectionHeading id="navigating">Navigating the App</SectionHeading>
            <P>TuyoApp has five main sections accessible from the bottom navigation bar.</P>

            <SubHeading id="dashboard">1. Dashboard</SubHeading>
            <P>
              Your main hub displays a personalized welcome message, today&apos;s weather forecast, and drying recommendations. View weather charts and receive warnings about <Hi>whether conditions</Hi> are suitable for sun-drying your tuyo today.
            </P>

            <SubHeading id="weather-icons">Weather Icons Guide</SubHeading>
            <P>
              The app uses weather icons to help you quickly understand current conditions and determine whether it is safe and effective to sun-dry tuyo.
            </P>
            <WeatherIconList />

            <SubHeading id="weather-alerts">Weather Alerts for Drying Fish</SubHeading>
            <P>
              Alerts are calculated using the current rain probability and cloud coverage. Each alert level indicates the expected drying conditions and the risk of drying fish outdoors.
            </P>
            <AlertTable />

            <SubHeading id="drying">2. Drying</SubHeading>
            <P>
              Monitor and track your <Hi>sun-dried fish drying process</Hi>. View ongoing batches and drying progress.
            </P>
            <P>
              The Drying page includes a dedicated module for beginners. You can create your own drying area or join existing ones to collaborate with other users. The module provides step-by-step guidance, real-time updates, and <Hi>progress tracking</Hi>.
            </P>

            <SubHeading id="scan-nav">3. Scan</SubHeading>
            <P>
              Capture images of your tuyo to analyze quality, detect defects, and get instant assessment results. Use the <Hi>phone camera</Hi> or select from your gallery, then tap <Hi>Scan</Hi> to start analysis.
            </P>
            <P>
              The app will detect whether the tuyo is <Hi>undried</Hi>, <Hi>dry</Hi>, or <Hi>rejected</Hi>.
            </P>

            <SubHeading id="notifications">4. Notifications</SubHeading>
            <P>
              Stay updated with alerts, reminders, and important updates. The app sends <Hi>weather notifications</Hi> up to two days in advance, timed to your scheduled drying activities.
            </P>
            <P>
              You&apos;ll also receive <Hi>drying progress</Hi> updates and important <Hi>announcements</Hi> related to app features.
            </P>

            <SubHeading id="settings-nav">5. Settings</SubHeading>
            <P>
              Manage your profile, adjust app preferences, and customize your experience. View and update your <Hi>user profile</Hi>, change your password, and access the <Hi>FAQ</Hi>, <Hi>Help Center</Hi>, <Hi>Terms of Service</Hi>, <Hi>About</Hi> pages, and <Hi>log out</Hi>.
            </P>

            {/* ── Roles ── */}
            <SectionHeading id="roles">Drying Area Roles & Permissions</SectionHeading>
            <P>
              After joining or creating a drying area, users are assigned roles that determine what actions they can perform.
            </P>

            <RoleCard id="admin-role" title="Admin" badge="Drying Area Owner">
              <P>Users who <Hi>create a drying area</Hi> automatically become the admin and have full control over its management.</P>
              <P>Admins can edit drying area information, <Hi>create and delete trays</Hi>, manage drying timelines, harvest batches, and delete the entire drying area.</P>
            </RoleCard>

            <RoleCard id="member-role" title="Member" badge="Limited Access">
              <P>Members have limited access and can only use trays created by the admin. They can create drying timelines, monitor drying progress, and harvest their assigned batches.</P>
            </RoleCard>

            <Callout>
              💡 This role-based setup ensures proper control, organized workflows, and smooth collaboration inside each drying area.
            </Callout>

            {/* ── Scan Guide ── */}
            <SectionHeading id="scan-guide">Scan Methods & Guidelines</SectionHeading>
            <P>The Scan feature allows users to analyze dried fish quality using image recognition.</P>

            <SubHeading id="scan-methods">How to Scan</SubHeading>
            <StepCard number={1} title="Access the Scan feature">
              Available from the <Hi>main hub</Hi> (between Drying and Notifications) or inside a tray in the middle of the timeline view.
            </StepCard>
            <StepCard number={2} title="Capture or select an image">
              Open the camera or choose an image from your gallery.
            </StepCard>
            <StepCard number={3} title="Tap Scan">
              Tap <Hi>Scan</Hi> to begin image analysis and receive instant results.
            </StepCard>

            <div className="my-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
              <p className="font-semibold mb-2">📐 Scanning Tips</p>
              <ul className="space-y-1.5 text-amber-700">
                <li className="flex items-start gap-2"><span>•</span><span>Fish must be laid <strong>flat</strong>, not tilted</span></li>
                <li className="flex items-start gap-2"><span>•</span><span>Camera distance should be no more than <strong>30 cm</strong></span></li>
                <li className="flex items-start gap-2"><span>•</span><span>Ensure good lighting for accurate results</span></li>
                <li className="flex items-start gap-2"><span>•</span><span>Designed specifically for <strong>lawlaw fish</strong> — other fish types may return inaccurate results</span></li>
              </ul>
            </div>

            <SubHeading id="classification">Fish Classification</SubHeading>
            <P>
              The scan feature classifies your fish based on dryness level and quality. Each result is color-coded for quick identification.
            </P>
            <ClassificationTable />

            {/* ── Footer callout ── */}
            <div className="mt-12 rounded-xl border border-[#c0d8ef] bg-[#e8f0f8] p-6">
              <p className="text-base font-semibold text-[#0d2e47] mb-2">Need more help?</p>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                Explore the Help Center, review the FAQ, or check the Terms of Service and About sections for more information.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                If you encounter issues not covered here, contact the developer through the <Hi>About</Hi> section.
              </p>
            </div>

          </div>
        </main>

        {/* ── Right TOC ── */}
        <aside className="hidden xl:block fixed top-14 right-0 bottom-0 w-52 overflow-y-auto py-8 px-4 border-l border-slate-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3 px-2">
            On this page
          </p>
          <div className="flex flex-col gap-0.5">
            {NAV.flatMap((s) =>
              s.children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => scrollTo(c.id)}
                  className={`text-left text-[12px] py-1 px-2 rounded transition-colors ${
                    activeId === c.id
                      ? "text-[#155183] font-medium"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {c.label}
                </button>
              ))
            )}
          </div>
        </aside>

      </div>
    </div>
  )
}