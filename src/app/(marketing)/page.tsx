"use client"

import Link from "next/link"
import { ArrowRight, Leaf, BarChart3, Heart, TrendingDown, Zap, Check, Cloud, FileText, Mail, DollarSign, Menu, X, Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled ? "border-b border-white/5 bg-black/60 backdrop-blur-2xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <motion.img
              src="/icon.svg"
              alt="ZeroWaste AI"
              className="h-8 w-8"
              whileHover={{ rotate: 10, scale: 1.05 }}
            />
            <span className="text-sm font-bold text-white">ZeroWaste AI</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              How it Works
            </a>
            <a href="#impact" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Impact
            </a>
            <button
              onClick={() => setDark(!dark)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-white"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <Link
              href="/login"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-bmw-surface-soft"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg px-4 py-2 text-sm font-bold text-black transition-all hover:scale-[1.02]"
              style={{ background: "#22c55e" }}
            >
              Get Started
            </Link>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setDark(!dark)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <motion.div
            className="border-t border-white/5 bg-black/95 px-6 pb-6 pt-4 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <nav className="flex flex-col gap-3">
              <a href="#features" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-zinc-400">Features</a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-zinc-400">How it Works</a>
              <a href="#impact" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-zinc-400">Impact</a>
              <div className="mt-2 flex gap-3">
                <Link href="/login" className="flex-1 rounded-lg border border-white/10 py-2.5 text-center text-sm text-white">Sign In</Link>
                <Link href="/register" className="flex-1 rounded-lg py-2.5 text-center text-sm font-bold text-black" style={{ background: "#22c55e" }}>Get Started</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      <main>
        <section className="relative flex min-h-[95vh] flex-col items-center justify-center overflow-hidden px-6 pt-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />
            <div className="absolute right-1/4 top-1/4 h-[300px] w-[300px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />
            <div className="absolute bottom-1/4 left-1/4 h-[200px] w-[200px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />
          </div>

          <motion.div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-bmw-surface-soft px-4 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="flex h-2 w-2 rounded-full" style={{ background: "#22c55e" }} />
            AI-Powered Food Intelligence for Restaurants
          </motion.div>

          <motion.h1
            className="max-w-4xl text-center text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.08] tracking-tight text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Know exactly how much to cook.{" "}
            <span className="gradient-text">Waste nothing.</span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-2xl text-center text-lg font-light leading-relaxed text-zinc-400"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            ZeroWaste AI connects to your restaurant data — billing, reservations, emails, spreadsheets — and tells you how many customers to expect, what to prepare, and when surplus is ready for donation.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/register"
              className="group inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold text-black transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "#22c55e" }}
            >
              Start Free Trial
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 px-6 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-bmw-surface-soft"
            >
              <Zap size={14} />
              Watch Demo
            </Link>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="flex items-center gap-1.5"><Check size={12} style={{ color: "#22c55e" }} /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check size={12} style={{ color: "#22c55e" }} /> 5-min setup</span>
            <span className="flex items-center gap-1.5"><Check size={12} style={{ color: "#22c55e" }} /> Connect your existing tools</span>
            <span className="flex items-center gap-1.5"><Check size={12} style={{ color: "#22c55e" }} /> 18% waste reduction</span>
          </motion.div>

          <div className="mt-16 w-full max-w-5xl rounded-2xl border border-white/5 bg-bmw-surface-soft/30 p-1 backdrop-blur-sm">
            <div className="rounded-xl border border-white/5 bg-bg-surface-strong/50 p-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                </div>
                <span className="ml-2 text-xs text-zinc-600">Dashboard Preview</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {[
                  { label: "Expected Today", value: "291 guests", accent: true },
                  { label: "Recommended Prep", value: "167 items", accent: false },
                  { label: "Meals Saved", value: "76 this month", accent: false },
                  { label: "CO₂ Avoided", value: "133 kg", accent: false },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    className="rounded-lg border border-white/5 bg-bmw-surface-soft/30 p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                  >
                    <div className="text-[10px] font-medium text-zinc-500">{s.label}</div>
                    <div className={`mt-1 text-sm font-bold ${s.accent ? "text-green-400" : "text-white"}`}>{s.value}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="relative px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-bmw-surface-soft px-4 py-1.5 text-xs font-medium text-zinc-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Everything you need
            </motion.div>
            <motion.h2
              className="max-w-2xl text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Your restaurant data, unified in one place.
            </motion.h2>
            <motion.p
              className="mt-3 max-w-xl text-base font-light text-zinc-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              Connect the tools you already use. ZeroWaste AI reads your data and gives you clear answers — no technical setup required.
            </motion.p>

            <div className="mt-16 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Mail,
                  title: "Connect Gmail",
                  desc: "Read reservation emails, order confirmations, and vendor communications automatically.",
                  color: "#ea4335",
                },
                {
                  icon: DollarSign,
                  title: "Connect Billing",
                  desc: "Link your POS or billing system — Zomato, Swiggy, Petpooja, or any billing app with export.",
                  color: "#22c55e",
                },
                {
                  icon: FileText,
                  title: "Upload Files",
                  desc: "Drag-and-drop old spreadsheets, PDF reports, or CSV exports. The AI reads everything.",
                  color: "#3b82f6",
                },
                {
                  icon: Cloud,
                  title: "Google Drive",
                  desc: "Connect Drive to scan menus, inventory sheets, past invoices, and planning docs.",
                  color: "#fbbc04",
                },
                {
                  icon: BarChart3,
                  title: "Live Dashboard",
                  desc: "See customer forecasts, prep recommendations, and donation opportunities at a glance.",
                  color: "#22c55e",
                },
                {
                  icon: Heart,
                  title: "Auto Donations",
                  desc: "When surplus is predicted, we match it with nearby NGOs and schedule pickup — automatically.",
                  color: "#ec4899",
                },
              ].map((feat, i) => (
                <motion.div
                  key={feat.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-bmw-surface-soft/30 p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-bmw-surface-soft">
                    <feat.icon size={18} style={{ color: feat.color }} />
                  </div>
                  <h3 className="text-base font-bold text-white">{feat.title}</h3>
                  <p className="mt-1.5 text-sm font-light leading-relaxed text-zinc-400">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative overflow-hidden px-6 py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />
          </div>
          <div className="mx-auto max-w-7xl">
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-bmw-surface-soft px-4 py-1.5 text-xs font-medium text-zinc-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              How it Works
            </motion.div>
            <motion.h2
              className="max-w-2xl text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Set up in 3 minutes. Start saving in one day.
            </motion.h2>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Create your account",
                  desc: "Tell us about your restaurant. Name, cuisine, location — that's it.",
                  items: ["Business name & type", "Your name & role", "Phone & email"],
                },
                {
                  step: "02",
                  title: "Connect your data",
                  desc: "Link Gmail, billing apps, or upload files. We read everything in minutes.",
                  items: ["Gmail & Google Drive", "Billing systems (Zomato, Swiggy, etc.)", "Spreadsheets & PDFs"],
                },
                {
                  step: "03",
                  title: "Get your forecast",
                  desc: "The AI analyzes your history and starts predicting — from day one.",
                  items: ["Customer count forecast", "Cooking recommendations", "Surplus & donation alerts"],
                },
              ].map((step, i) => (
                <motion.div
                  key={step.step}
                  className="relative rounded-2xl border border-white/5 bg-bmw-surface-soft/30 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: "#22c55e" }}>
                    {step.step}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-zinc-400">{step.desc}</p>
                  <ul className="mt-4 flex flex-col gap-2">
                    {step.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-zinc-500">
                        <Check size={12} style={{ color: "#22c55e" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="impact" className="relative overflow-hidden px-6 py-32" style={{ background: "var(--color-bg-dark)" }}>
          <div className="mx-auto max-w-7xl">
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-bmw-surface-soft px-4 py-1.5 text-xs font-medium text-zinc-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Real Impact
            </motion.div>
            <motion.h2
              className="max-w-2xl text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Measurable results, every week.
            </motion.h2>

            <div className="mt-12 grid gap-4 md:grid-cols-4">
              {[
                { value: "₹8,700", label: "Saved per day per restaurant", accent: true },
                { value: "18%", label: "Waste reduction in week 1", accent: true },
                { value: "92%", label: "Prediction accuracy by week 8", accent: false },
                { value: "2,500+", label: "Meals donated per month", accent: true },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="rounded-2xl border border-white/5 bg-bmw-surface-soft/30 p-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className={`inline-flex items-baseline gap-0.5 text-[clamp(1.75rem,3vw,2.5rem)] font-bold ${stat.accent ? "text-green-400" : "text-white"}`}>
                    {stat.value}
                  </div>
                  <p className="mt-1.5 text-sm text-zinc-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-6 py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />
          </div>
          <div className="mx-auto max-w-2xl text-center">
            <motion.h2
              className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to know exactly what to cook?
            </motion.h2>
            <motion.p
              className="mt-4 text-lg font-light leading-relaxed text-zinc-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
            >
              Free to start. No credit card. No POS integration needed. Just connect your data and let the AI do the rest.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <Link
                href="/register"
                className="group inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold text-black transition-all duration-300 hover:scale-[1.02]"
                style={{ background: "#22c55e" }}
              >
                Start Free Trial
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 px-6 text-sm font-medium text-white transition-all hover:border-white/20"
              >
                Talk to Sales
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="ZeroWaste AI" className="h-7 w-7" />
            <span className="text-xs font-bold text-white">ZeroWaste AI</span>
          </div>
          <span className="text-xs text-zinc-600">&copy; 2026 ZeroWaste AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
