"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"

const googleConfigured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

function GoogleButton() {
  function handleGoogleSignIn() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return
    const redirectUri = `${window.location.origin}/api/auth/connect/callback`
    const scope = "openid email profile"
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=signin`
    window.location.href = authUrl
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={!googleConfigured}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-bmw-hairline text-sm font-medium text-bmw-ink transition-all hover:bg-bmw-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
      title={!googleConfigured ? "Google Sign-In not configured" : ""}
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Continue with Google
    </button>
  )
}

function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.auth.login(email, password)
      router.push("/app")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4" style={{ background: "var(--color-bg)" }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />
      </div>

      <motion.div
        className="relative w-full max-w-sm"
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
            <h1 className="text-title-md text-bmw-ink">Welcome back</h1>
            <p className="mt-1 text-sm font-light text-bmw-muted">
              Sign in to your account
            </p>
          </div>

          <GoogleButton />

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "var(--color-border)" }} />
            <span className="text-xs text-bmw-muted-soft">or</span>
            <div className="h-px flex-1" style={{ background: "var(--color-border)" }} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  className="rounded-lg bg-error/10 p-3 text-center text-sm text-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-bmw-muted">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none transition-all duration-200 focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-bmw-muted">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none transition-all duration-200 focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                placeholder="••••••••"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="group mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-black transition-all duration-300 disabled:opacity-50"
              style={{ background: "#22c55e" }}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
            >
              {loading ? (
                <span className="inline-block h-4 w-4 rounded-full border-2 border-black/30 border-t-black" style={{ animation: "spin 0.8s linear infinite" }} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </motion.button>
          </form>
        </div>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-xs text-bmw-muted-soft">
            Don't have an account?{" "}
            <Link href="/register" className="text-accent hover:brightness-110">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="dark">
      <LoginForm />
    </div>
  )
}
