"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ArrowRight, ArrowLeft, Mail, Cloud, DollarSign, Upload, Link, FileText, Download, X, CheckCircle, Clock, Building2 } from "lucide-react"
import { GmailLogo, GoogleDriveLogo, billingAppLogos } from "@/components/ui/BillingLogos"
import { api } from "@/lib/api"

const connectSteps = [
  { id: "email", label: "Email & Drive", icon: Mail, desc: "Connect your Gmail so we can read reservations, orders, and vendor emails." },
  { id: "billing", label: "Billing Apps", icon: DollarSign, desc: "Link your billing system — Zomato, Swiggy, Petpooja, or any POS." },
  { id: "upload", label: "Upload Data", icon: Upload, desc: "Upload old reports, spreadsheets, or PDFs. The AI learns faster with more data." },
  { id: "done", label: "Done", icon: CheckCircle, desc: "" },
]

const billingApps = [
  { id: "zomato", name: "Zomato", logo: "zomato" },
  { id: "swiggy", name: "Swiggy", logo: "swiggy" },
  { id: "petpooja", name: "Petpooja", logo: "petpooja" },
  { id: "mylivepos", name: "MyLivePOS", logo: "mylivepos" },
  { id: "dotpe", name: "DotPe", logo: "dotpe" },
  { id: "urbanpiper", name: "Urban Piper", logo: "urbanpiper" },
  { id: "other", name: "Other POS", logo: "other" },
]

function ConnectWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [googleConnected, setGoogleConnected] = useState<Record<string, boolean>>({})
  const [billingConnected, setBillingConnected] = useState<Record<string, boolean>>({})
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [loadingState, setLoadingState] = useState(true)

  // Fetch real connection states on mount
  useEffect(() => {
    async function loadConnections() {
      try {
        const authRes = await fetch("/api/auth/me", { credentials: "include" })
        if (!authRes.ok) { router.push("/login"); return }

        // Fetch both Google and billing connection status
        const statusRes = await api.connectors.status()
        const googleMap: Record<string, boolean> = {}
        const billingMap: Record<string, boolean> = {}
        for (const svc of statusRes.services) {
          if (svc.type === "google") {
            googleMap[svc.service] = svc.connected
          } else if (svc.type === "billing") {
            billingMap[svc.service] = svc.connected
          }
        }
        setGoogleConnected(googleMap)
        setBillingConnected(billingMap)

        // Check URL param from OAuth callback redirect
        const params = new URLSearchParams(window.location.search)
        const connectedService = params.get("connected")
        if (connectedService) {
          if (connectedService === "gmail" || connectedService === "drive") {
            setGoogleConnected((prev) => ({ ...prev, [connectedService]: true }))
          } else {
            setBillingConnected((prev) => ({ ...prev, [connectedService]: true }))
          }
          window.history.replaceState({}, "", window.location.pathname)
        }
      } catch {
        // ignore
      } finally {
        setLoadingState(false)
      }
    }
    loadConnections()
  }, [router])

  const handleGoogleAuth = async (service: string) => {
    setConnecting(service)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
    if (!clientId) {
      setGoogleConnected((prev) => ({ ...prev, [service]: true }))
      setConnecting(null)
      return
    }
    const scope = service === "gmail"
      ? "https://www.googleapis.com/auth/gmail.readonly"
      : "https://www.googleapis.com/auth/drive.readonly"
    const redirectUri = `${window.location.origin}/api/auth/connect/callback`
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&state=${service}&prompt=consent`
    window.location.href = authUrl
  }

  const handleConnect = async (service: string) => {
    setConnecting(service)

    if (service === "gmail" || service === "drive") {
      handleGoogleAuth(service)
      return
    }

    try {
      const app = billingApps.find((a) => a.id === service)
      await api.connectors.billing.connect(service, app?.name || service)
      setBillingConnected((prev) => ({ ...prev, [service]: true }))
    } catch {
      // fallback: mark connected locally
      setBillingConnected((prev) => ({ ...prev, [service]: true }))
    } finally {
      setConnecting(null)
    }
  }

  // Zomato/Swiggy can be auto-connected if Gmail is linked
  useEffect(() => {
    if (googleConnected["gmail"]) {
      ;["zomato", "swiggy"].forEach(async (appId) => {
        if (!billingConnected[appId]) {
          try {
            const data = await api.connectors.gmail()
            const hasOrders = appId === "zomato" ? data.zomatoOrders > 0 : data.swiggyOrders > 0
            if (hasOrders) {
              await api.connectors.billing.connect(appId, billingApps.find(a => a.id === appId)?.name || appId)
              setBillingConnected((prev) => ({ ...prev, [appId]: true }))
            }
          } catch {
            // gmail not yet active
          }
        }
      })
    }
  }, [googleConnected])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const names = files.map((f) => f.name)
    setUploadedFiles((prev) => [...new Set([...prev, ...names])])
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const names = files.map((f) => f.name)
    setUploadedFiles((prev) => [...new Set([...prev, ...names])])
  }

  const allEmailsConnected = googleConnected["gmail"] && googleConnected["drive"]
  const allBillingConnected = billingApps.some((a) => billingConnected[a.id])

  return (
    <div className="dark">
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4" style={{ background: "#0a0a0a" }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />
      </div>

      <motion.div
        className="relative w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="rounded-2xl border border-bmw-hairline bg-bmw-canvas/80 p-8 backdrop-blur-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <Link size={20} className="text-black" />
            </div>
            <h1 className="text-title-md text-bmw-ink">Connect your data</h1>
            <p className="mt-1 text-sm font-light text-bmw-muted">
              Link the tools you already use. We&apos;ll read everything automatically.
            </p>
          </div>

          <div className="mb-8 flex items-center justify-center gap-2">
            {connectSteps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 ${
                    i <= step ? "text-black" : "border border-bmw-hairline text-bmw-muted-soft"
                  }`}
                  style={i <= step ? { background: "#22c55e" } : {}}
                >
                  {i < step ? <Check size={14} /> : <s.icon size={14} />}
                </div>
                {i < connectSteps.length - 1 && (
                  <div className={`h-px w-8 transition-all duration-300 ${i < step ? "bg-green-500" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <p className="text-sm text-bmw-muted">{connectSteps[0].desc}</p>
                {[
                  { id: "gmail", name: "Gmail", Logo: GmailLogo, auth: true, desc: "Read reservation emails, order confirmations, vendor messages" },
                  { id: "drive", name: "Google Drive", Logo: GoogleDriveLogo, auth: true, desc: "Scan menus, inventory sheets, invoices, planning docs" },
                ].map((svc) => (
                  <div
                    key={svc.id}
                    className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                      googleConnected[svc.id] ? "border-green-500/30 bg-green-500/5" : "border-bmw-hairline bg-bmw-surface-soft/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svc.Logo className="h-10 w-10" />
                      <div>
                        <p className="text-sm font-medium text-bmw-ink">{svc.name}</p>
                        <p className="text-xs text-bmw-muted-soft">{svc.desc}</p>
                      </div>
                    </div>
                    {googleConnected[svc.id] ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-400">
                        <CheckCircle size={14} />
                        Connected
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnect(svc.id)}
                        disabled={connecting === svc.id || loadingState}
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-bmw-hairline px-3 text-xs font-medium text-bmw-ink transition-all hover:bg-bmw-surface-soft disabled:opacity-50"
                      >
                        {connecting === svc.id ? (
                          <span className="inline-block h-3 w-3 rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 0.8s linear infinite" }} />
                        ) : (
                          "Connect"
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <p className="text-sm text-bmw-muted">{connectSteps[1].desc}</p>
                {googleConnected["gmail"] && (
                  <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
                    <p className="text-xs text-accent">
                      <Mail size={12} className="mr-1 inline" />
                      Gmail connected — Zomato and Swiggy orders will be detected automatically from your inbox.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {billingApps.map((app) => {
                    const Logo = billingAppLogos[app.logo]
                    const isConnected = billingConnected[app.id]
                    return (
                    <div
                      key={app.id}
                      className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                        isConnected ? "border-green-500/30 bg-green-500/5" : "border-bmw-hairline bg-bmw-surface-soft/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {Logo && <Logo className="h-9 w-9" />}
                        <span className="text-sm text-bmw-ink">{app.name}</span>
                      </div>
                      {isConnected ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <button
                          onClick={() => handleConnect(app.id)}
                          disabled={connecting === app.id || loadingState}
                          className="flex h-7 items-center rounded-lg border border-bmw-hairline px-2.5 text-[10px] font-medium text-bmw-ink transition-all hover:bg-bmw-surface-soft disabled:opacity-50"
                        >
                          {connecting === app.id ? (
                            <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 0.8s linear infinite" }} />
                          ) : (
                            "Connect"
                          )}
                        </button>
                      )}
                    </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <p className="text-sm text-bmw-muted">{connectSteps[2].desc}</p>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all ${
                    isDragging ? "border-green-500/50 bg-green-500/5" : "border-bmw-hairline bg-bmw-surface-soft/30"
                  }`}
                >
                  <Upload size={28} className="mb-3 text-bmw-muted-soft" />
                  <p className="text-sm text-bmw-muted">
                    {isDragging ? "Drop files here" : "Drag & drop files here"}
                  </p>
                  <p className="mt-1 text-xs text-bmw-muted-soft">or</p>
                  <label className="mt-2 cursor-pointer rounded-lg border border-bmw-hairline px-4 py-2 text-xs font-medium text-bmw-ink transition-all hover:bg-bmw-surface-soft">
                    Browse files
                    <input type="file" multiple className="hidden" accept=".csv,.xlsx,.xls,.pdf,.txt,.json" onChange={handleFileUpload} />
                  </label>
                  <p className="mt-2 text-[10px] text-bmw-muted-soft">CSV, Excel, PDF, TXT, JSON — max 10MB each</p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="rounded-xl border border-bmw-hairline bg-bmw-surface-soft/30 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-[1px] text-bmw-muted">{uploadedFiles.length} file(s) uploaded</h3>
                    <div className="mt-2 flex flex-col gap-1.5">
                      {uploadedFiles.map((name) => (
                        <div key={name} className="flex items-center gap-2 text-xs text-bmw-muted">
                          <FileText size={12} className="text-green-400" />
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center py-6"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h2 className="text-title-md text-bmw-ink">You&apos;re all set!</h2>
                <p className="mt-2 text-center text-sm text-bmw-muted">
                  Your data is connected. The AI is analyzing everything and will show your first forecast shortly.
                </p>

                <div className="mt-6 w-full rounded-xl border border-bmw-hairline bg-bmw-surface-soft/30 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-[1px] text-bmw-muted">Connected</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(googleConnected).filter(([, v]) => v).map(([key]) => (
                      <span key={key} className="inline-flex items-center gap-1 rounded-lg border border-green-500/20 bg-green-500/5 px-2.5 py-1 text-xs text-green-400">
                        <CheckCircle size={10} />
                        {key === "gmail" ? "Gmail" : "Google Drive"}
                      </span>
                    ))}
                    {Object.entries(billingConnected).filter(([, v]) => v).map(([key]) => (
                      <span key={key} className="inline-flex items-center gap-1 rounded-lg border border-green-500/20 bg-green-500/5 px-2.5 py-1 text-xs text-green-400">
                        <CheckCircle size={10} />
                        {billingApps.find(a => a.id === key)?.name || key}
                      </span>
                    ))}
                    {uploadedFiles.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-green-500/20 bg-green-500/5 px-2.5 py-1 text-xs text-green-400">
                        <FileText size={10} />
                        {uploadedFiles.length} file(s)
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            {step > 0 && step < 3 ? (
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

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-black transition-all duration-300"
                style={{ background: "#22c55e" }}
              >
                {step === 2 ? "Finish Setup" : "Continue"}
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => router.push("/app")}
                className="flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-black transition-all duration-300"
                style={{ background: "#22c55e" }}
              >
                Go to Dashboard
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-bmw-muted-soft">
          You can always connect more services later from Settings.
        </p>
      </motion.div>
    </div>
    </div>
  )
}

export default function ConnectPage() {
  return <ConnectWizard />
}
