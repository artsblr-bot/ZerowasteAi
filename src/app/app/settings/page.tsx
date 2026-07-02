"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionComponents"
import { motion } from "framer-motion"
import { Moon, Sun, LogOut, User, Link2, Bell, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <FadeUp>
        <div>
          <h1 className="text-display-sm text-bmw-ink">Settings</h1>
          <p className="mt-1 text-sm font-light text-bmw-muted">Profile · Integrations · Preferences</p>
        </div>
      </FadeUp>

      <FadeUp>
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center gap-2">
            <User size={16} className="text-accent" />
            <h2 className="text-title-sm text-bmw-ink">Restaurant Profile</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingField label="Restaurant Name" value="Raj's Kitchen" />
            <SettingField label="Cuisine Type" value="North Indian, Mughlai" />
            <SettingField label="Open Time" value="10:00 AM" />
            <SettingField label="Close Time" value="11:00 PM" />
            <SettingField label="Address" value="Indiranagar, Bangalore" />
            <SettingField label="Plan" value="Starter · ₹2,999/mo" />
          </div>
          <div className="mt-4">
            <Button variant="secondary">Edit Profile</Button>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 size={16} className="text-accent" />
              <h2 className="text-title-sm text-bmw-ink">Integrations</h2>
            </div>
            <Badge variant="success">2 Connected</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <IntegrationCard name="POS System" provider="Petpooja" status="connected" desc="Orders and reservations synced in real-time" />
            <IntegrationCard name="Weather API" provider="OpenWeatherMap" status="connected" desc="Live weather data for demand prediction" />
            <IntegrationCard name="Google Maps" provider="Maps API" status="disconnected" desc="Route optimization and ETA prediction" />
            <IntegrationCard name="Smart Scale" provider="IoT Device" status="disconnected" desc="Automatic waste tracking with hardware" />
          </div>
        </div>
      </FadeUp>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FadeUp delay={0.15}>
          <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
            <div className="mb-4 flex items-center gap-2">
              <Bell size={16} className="text-accent" />
              <h2 className="text-title-sm text-bmw-ink">Alert Preferences</h2>
            </div>
            <div className="flex flex-col gap-3">
              <ToggleRow label="Daily prediction summary" enabled />
              <ToggleRow label="Low inventory alerts" enabled />
              <ToggleRow label="Surplus donation notification" enabled />
              <ToggleRow label="Weekly performance report" enabled={false} />
              <ToggleRow label="NGO pickup confirmation" enabled />
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
            <div className="mb-4 flex items-center gap-2">
              <Moon size={16} className="text-accent" />
              <h2 className="text-title-sm text-bmw-ink">Appearance</h2>
            </div>
            <motion.button
              onClick={toggleDark}
              className="flex w-full items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3.5 transition-all duration-200 hover:border-accent/30"
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                {dark ? <Sun size={16} className="text-warning" /> : <Moon size={16} className="text-bmw-muted" />}
                <span className="text-sm text-bmw-ink">{dark ? "Light Mode" : "Dark Mode"}</span>
              </div>
              <div
                className={`flex h-6 w-10 items-center rounded-full transition-colors duration-300 ${
                  dark ? "bg-accent" : "bg-bmw-hairline-strong"
                }`}
              >
                <motion.div
                  className="h-4 w-4 rounded-full bg-white"
                  animate={{ x: dark ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </motion.button>
          </div>
        </FadeUp>
      </div>

      <FadeUp delay={0.25}>
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-error" />
            <h2 className="text-title-sm text-bmw-ink">Danger Zone</h2>
          </div>
          <div className="flex items-center justify-between rounded-btn p-4" style={{ background: "color-mix(in srgb, var(--color-error) 6%, transparent)" }}>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-error">Delete Account</span>
              <span className="text-xs font-light text-bmw-muted">This will permanently delete all your data</span>
            </div>
            <Button variant="secondary" className="!border-error !text-error hover:bg-error/10">
              Delete
            </Button>
          </div>
        </div>
      </FadeUp>
    </div>
  )
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-bmw-muted">{label}</span>
      <span className="text-sm font-bold text-bmw-ink">{value}</span>
    </div>
  )
}

function IntegrationCard({ name, provider, status, desc }: { name: string; provider: string; status: string; desc: string }) {
  return (
    <motion.div
      className="flex items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3 transition-all duration-200 hover:border-accent/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-bmw-ink">{name}</span>
          <span className="text-xs font-light text-bmw-muted">({provider})</span>
        </div>
        <span className="text-xs font-light text-bmw-muted">{desc}</span>
      </div>
      <Badge variant={status === "connected" ? "success" : "default"}>
        {status === "connected" ? "Connected" : "Disconnected"}
      </Badge>
    </motion.div>
  )
}

function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-bmw-ink">{label}</span>
      <motion.div
        className={`flex h-6 w-10 cursor-pointer items-center rounded-full transition-colors ${
          enabled ? "bg-accent" : "bg-bmw-hairline-strong"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="h-4 w-4 rounded-full bg-white"
          animate={{ x: enabled ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </div>
  )
}
