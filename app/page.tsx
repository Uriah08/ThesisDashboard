"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

const NAV_LINKS = ["Features", "How It Works", "About", "Download"]

const FEATURES = [
  {
    icon: "🌤️",
    title: "Weather Updates",
    desc: "Get real-time weather conditions so you know the best days to dry your fish.",
  },
  {
    icon: "🗂️",
    title: "Manage Your Trays",
    desc: "Organize and monitor each drying tray — track status, capacity, and progress across your farm.",
  },
  {
    icon: "📸",
    title: "AI Image Scanning",
    desc: "Point your camera at your fish. FiScan instantly detects if it's ready for harvest using image processing.",
  },
  {
    icon: "📦",
    title: "Production Tracking",
    desc: "Log every batch — quantity, drying method, and location — all in one place.",
  },
]

const STEPS = [
  {
    number: "01",
    title: "Scan your fish",
    desc: "Open the app and point your camera at the drying fish. Our image processing model analyzes color, texture, and dryness in seconds.",
  },
  {
    number: "02",
    title: "Get instant results",
    desc: "FiScan tells you if your fish is ready for harvest, still drying, or needs attention — no guesswork needed.",
  },
  {
    number: "03",
    title: "Log the batch",
    desc: "Record the scan result, quantity, and location. Build a history of every drying cycle on your farm.",
  },
  {
    number: "04",
    title: "Track & sell",
    desc: "Add your sales records and monitor your income. Review past data to improve your next harvest.",
  },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="bg-white text-zinc-900 min-h-screen font-sans antialiased">

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 h-16 bg-white/90 backdrop-blur-md transition-all duration-300 ${scrolled ? "border-b border-zinc-100" : ""}`}>
        <div className="flex items-center gap-3">
          <Image src="/icon.png" alt="FiScan" width={50} height={50} className="w-17.5"/>
          <Image src="/doa.png" alt="DOA" width={50} height={50} className="w-10"/>
        </div>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <li key={link}>
              <a href={`#${link.toLowerCase().replace(/\s/g, "-")}`} className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                {link}
              </a>
            </li>
          ))}
        </ul>

        <a href="/auth/sign-in" className="border border-[#155183] text-[#155183] hover:bg-[#155183] hover:text-white text-sm font-medium px-5 py-2 rounded-full transition-colors">
          Admin Sign In
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col justify-center px-8 md:px-16 pt-24 pb-20">
          <div className="max-w-4xl z-20">
            <p className="flex items-center gap-2 text-[#155183] text-xs font-semibold tracking-widest uppercase mb-6">
              <span className="w-6 h-px bg-[#155183]" />
              AI-Powered · Built for Filipino Naic Sun Dried Fish Farmers
            </p>

            <h1 className="text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight text-zinc-900 mb-6">
              Manage your <br />
              <span className="text-[#155183] italic font-serif">sundried fish</span> <br />
              farm with ease.
            </h1>

            <p className="text-lg text-zinc-500 font-light max-w-md leading-relaxed mb-10">
              Point. Scan. Decide. FiScan uses image processing to tell you if your fish is dry enough — then helps you log production and track sales.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a href="/documentation" className="bg-[#155183] hover:bg-[#1e6aab] text-white font-medium px-8 py-3.5 rounded-lg transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2">
                <span>Documentation</span>
              </a>
            </div>
          </div>

          {/* Decorative stat row */}
          <div className="mt-20 flex flex-wrap gap-x-12 gap-y-6">
            {[["500+", "Farms registered"], ["12k+", "Batches logged"], ["₱2M+", "Sales tracked"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-[#155183]">{val}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        <Image src={'/cover.jpg'} width={1000} height={1000} alt="Cover" className="absolute right-0 top-0 z-10 
             mask-[linear-gradient(to_right,transparent,black)] 
             [WebkitMaskImage:linear-gradient(to_right,transparent,black)] hidden lg:block"/>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-8 md:px-16 py-24 border-t border-zinc-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#155183] mb-4">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-16 max-w-lg">
            Manage that will suit your needs.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-zinc-100 hover:border-[#155183]/30 hover:shadow-sm transition-all group">
                <span className="text-2xl mb-4 block">{f.icon}</span>
                <h3 className="font-semibold text-zinc-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-8 md:px-16 py-24 bg-zinc-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#155183] mb-4">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-16 max-w-lg">
            From scan to sale, in four steps.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col gap-4">
                <span className="text-4xl font-bold text-[#155183]/15 leading-none">{step.number}</span>
                <div className="w-8 h-px bg-[#155183]" />
                <h3 className="font-semibold text-zinc-900 text-sm">{step.title}</h3>
                <p className="text-zinc-500 text-sm font-light leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="px-8 md:px-16 py-24 border-t border-zinc-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#155183] mb-4">About</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-6 leading-tight">
              Developed for the farmers of <span className="text-[#155183] italic font-serif">Naic, Cavite.</span>
            </h2>
            <p className="text-zinc-500 font-light text-base leading-relaxed mb-4">
              FiScan is a thesis project built to support the sundried fish farming community in Naic, Cavite. It was developed in partnership with the <span className="font-medium text-zinc-700">Department of Agriculture (DOA) Naic</span>, which oversees and manages farm operations for local fish farmers.
            </p>
            <p className="text-zinc-500 font-light text-base leading-relaxed mb-8">
              The app combines image processing technology with farm management tools — giving farmers a simple way to check harvest readiness, log production, and track sales, all from their phones.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-px bg-[#155183]" />
              <p className="text-xs text-zinc-400 tracking-wide">In partnership with DOA Naic</p>
            </div>
          </div>

          {/* Right side — two info cards */}
          <div className="flex flex-col gap-5">
            <div className="p-6 rounded-xl border border-zinc-100 bg-zinc-50">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#155183] mb-2">The Problem</p>
              <p className="text-zinc-600 text-sm font-light leading-relaxed">
                Naic fish farmers rely on experience and guesswork to determine if their sundried fish is ready. There is no consistent, data-driven method — leading to over-drying, spoilage, and lost income.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-100 bg-zinc-50">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#155183] mb-2">The Solution</p>
              <p className="text-zinc-600 text-sm font-light leading-relaxed">
                FiScan uses image processing to analyze fish dryness in real time — paired with production logging and sales tracking to give DOA Naic and farmers a complete view of every harvest cycle.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section id="download" className="px-8 md:px-16 py-32 border-t border-zinc-100">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#155183] mb-4">Download</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-tight">
            Get the app on your <span className="text-[#155183] italic font-serif">phone.</span>
          </h2>
          <p className="text-zinc-500 font-light mb-10 text-lg">
            Download FiScan and start scanning, logging, and managing your sundried fish production today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#" className="inline-flex items-center gap-3 bg-[#155183] hover:bg-[#1e6aab] text-white font-medium px-8 py-4 rounded-lg transition-all hover:-translate-y-0.5 text-sm">
              <span className="text-xl">⬇</span>
              <div className="text-left">
                <p className="text-[10px] opacity-70 leading-none mb-0.5">Download for</p>
                <p className="text-sm font-semibold leading-none">Android APK</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-8 md:px-16 py-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Image src="/icon.png" alt="FiScan" width={50} height={50} className="w-17.5"/>
        <p className="text-zinc-400 text-xs">© {new Date().getFullYear()} FiScan. All rights reserved.</p>
      </footer>

    </div>
  )
}