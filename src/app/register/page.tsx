"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ArrowRight, ArrowLeft, Store, User, Lock, Building2, ChefHat, Phone, Mail, Globe } from "lucide-react"
import { api } from "@/lib/api"

const steps = [
  { id: "business", label: "Business", icon: Store },
  { id: "you", label: "Your Details", icon: User },
  { id: "account", label: "Account", icon: Lock },
]

const orgTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "hotel", label: "Hotel" },
  { value: "cafe", label: "Café" },
  { value: "cloud_kitchen", label: "Cloud Kitchen" },
  { value: "catering", label: "Catering Service" },
  { value: "bakery", label: "Bakery" },
  { value: "hostel", label: "Hostel / Cafeteria" },
  { value: "ngo", label: "NGO" },
]

const cuisineTypes = [
  "North Indian", "South Indian", "Chinese", "Italian", "Continental", "Mughlai", "Gujarati", "Maharashtrian", "Multi-cuisine", "Bakery", "Other",
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    organizationName: "",
    organizationType: "restaurant",
    cuisineType: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    if (step === 0) return form.organizationName.length >= 2
    if (step === 1) return form.name.length >= 2 && form.email.includes("@")
    if (step === 2) return form.password.length >= 8
    return false
  }

  async function handleSubmit() {
    setLoading(true)
    setError("")
    try {
      const result = await api.auth.register({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        role: form.role || "owner",
        cuisineType: form.cuisineType,
        organizationName: form.organizationName,
        organizationType: form.organizationType as any,
      })
      router.push("/setup/connect")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark">
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4" style={{ background: "var(--color-bg)" }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-2xl border border-bmw-hairline bg-bmw-canvas/80 p-8 backdrop-blur-2xl">
          <div className="mb-8 text-center">
            <Link href="/" className="mx-auto mb-4 flex w-fit items-center gap-2">
              <img src="/icon.svg" alt="ZeroWaste AI" className="h-10 w-10" />
              <span className="text-sm font-bold text-bmw-ink">ZeroWaste AI</span>
            </Link>
            <h1 className="text-title-md text-bmw-ink">Set up your restaurant</h1>
            <p className="mt-1 text-sm font-light text-bmw-muted">
              {step === 0 && "Tell us about your business"}
              {step === 1 && "Your personal details"}
              {step === 2 && "Create your account"}
            </p>
          </div>

          <div className="mb-8 flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 ${
                    i <= step ? "text-black" : "border border-bmw-hairline text-bmw-muted"
                  }`}
                  style={i <= step ? { background: "#22c55e" } : {}}
                >
                  {i < step ? <Check size={14} /> : <s.icon size={14} />}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px w-8 transition-all duration-300 ${i < step ? "bg-green-500" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <motion.div
              className="mb-4 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-400"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="business"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-bmw-muted">Business name</label>
                  <input
                    value={form.organizationName}
                    onChange={(e) => update("organizationName", e.target.value)}
                    className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none transition-all duration-200 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                    placeholder="Raj's Kitchen"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-bmw-muted">Business type</label>
                  <select
                    value={form.organizationType}
                    onChange={(e) => update("organizationType", e.target.value)}
                    className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none transition-all duration-200 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                  >
                    {orgTypes.map((t) => (
                      <option key={t.value} value={t.value} className="bg-zinc-900">{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-bmw-muted">Cuisine type (optional)</label>
                  <select
                    value={form.cuisineType}
                    onChange={(e) => update("cuisineType", e.target.value)}
                    className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none transition-all duration-200 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                  >
                    <option value="" className="bg-zinc-900">Select cuisine</option>
                    {cuisineTypes.map((c) => (
                      <option key={c} value={c} className="bg-zinc-900">{c}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="you"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-bmw-muted">Your name</label>
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none transition-all duration-200 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                    placeholder="Raj Sharma"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-bmw-muted">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none transition-all duration-200 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                    placeholder="raj@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-bmw-muted">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none transition-all duration-200 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-bmw-muted">Your role (optional)</label>
                  <input
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none transition-all duration-200 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                    placeholder="Owner / Chef / Manager"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-bmw-muted">Set a password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none transition-all duration-200 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                    placeholder="At least 8 characters"
                  />
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`h-1 flex-1 rounded-full transition-all ${form.password.length >= 4 ? "bg-red-500" : "bg-white/10"}`} />
                    <div className={`h-1 flex-1 rounded-full transition-all ${form.password.length >= 6 ? "bg-yellow-500" : "bg-white/10"}`} />
                    <div className={`h-1 flex-1 rounded-full transition-all ${form.password.length >= 8 ? "bg-green-500" : "bg-white/10"}`} />
                  </div>
                  <span className="text-[10px] text-bmw-muted-soft">
                    {form.password.length < 4 ? "Weak" : form.password.length < 6 ? "Fair" : form.password.length < 8 ? "Good" : "Strong"}
                  </span>
                </div>

                <div className="mt-2 rounded-xl border border-bmw-hairline bg-bmw-surface-soft/30 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-[1px] text-bmw-muted">Summary</h3>
                  <div className="mt-2 flex flex-col gap-1.5 text-sm text-bmw-muted">
                    <p><span className="text-bmw-muted-soft">Business:</span> <span className="text-bmw-ink">{form.organizationName}</span></p>
                    <p><span className="text-bmw-muted-soft">Type:</span> <span className="text-bmw-ink">{orgTypes.find(t => t.value === form.organizationType)?.label}</span></p>
                    <p><span className="text-bmw-muted-soft">Name:</span> <span className="text-bmw-ink">{form.name}</span></p>
                    <p><span className="text-bmw-muted-soft">Email:</span> <span className="text-bmw-ink">{form.email}</span></p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex h-11 items-center gap-2 rounded-xl border border-bmw-hairline px-5 text-sm font-medium text-bmw-muted transition-all hover:border-bmw-hairline-strong hover:text-bmw-ink"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-black transition-all duration-300 disabled:opacity-40"
                style={{ background: canProceed() ? "#22c55e" : "#27272a" }}
              >
                Continue
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-black transition-all duration-300 disabled:opacity-40"
                style={{ background: canProceed() && !loading ? "#22c55e" : "#27272a" }}
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-black/30 border-t-black" style={{ animation: "spin 0.8s linear infinite" }} />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-bmw-muted-soft">
          Already have an account?{" "}
          <Link href="/login" className="text-green-400 hover:text-green-300">Sign in</Link>
        </p>
      </motion.div>
    </div>
    </div>
  )
}
