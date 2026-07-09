"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/Badge"
import { StatsCard } from "@/components/ui/StatsCard"
import { Button } from "@/components/ui/Button"
import { generateDonationQR } from "@/lib/qrcode"
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion/MotionComponents"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, X, Heart, Leaf, TrendingDown, Globe } from "lucide-react"

export default function DonationsPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)

  const { data: donations, isLoading } = useQuery({
    queryKey: ["donations"],
    queryFn: () => api.donations.list(),
    refetchInterval: 15000,
  })

  const { data: ngos } = useQuery({
    queryKey: ["ngos"],
    queryFn: () => api.ngos.list(),
  })

  const { data: surplus } = useQuery({
    queryKey: ["predictions-surplus"],
    queryFn: () => api.predictions.surplus(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.donations.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["donations"] }),
  })

  const selectedDonation = donations?.donations?.find((d) => d.id === selectedId)
  const totalDonated = donations?.donations?.reduce((s, d) => s + d.weightKg, 0) ?? 0
  const totalMeals = donations?.donations?.reduce((s, d) => s + (d.mealEquivalent ?? 0), 0) ?? 0
  const activePickups = donations?.donations?.filter((d) => d.status === "pending" || d.status === "matched").length ?? 0

  async function handleGenerateQR(donation: NonNullable<typeof donations>['donations'][number]) {
    updateMutation.mutate({ id: donation.id, data: { status: "matched" } })
    const dataUrl = await generateDonationQR(donation.id, donation.ngo?.name || "Unknown NGO", donation.weightKg)
    setShowQR(dataUrl)
  }

  async function handlePickup(donationId: string) {
    updateMutation.mutate({ id: donationId, data: { status: "picked_up" } })
  }

  async function handleDeliver(donationId: string) {
    updateMutation.mutate({ id: donationId, data: { status: "delivered" } })
  }

  async function handleVerify(donationId: string) {
    updateMutation.mutate({ id: donationId, data: { status: "verified" } })
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-sm text-bmw-ink">Donations</h1>
            <p className="mt-1 text-sm font-light text-bmw-muted">
              Surplus matching · NGO coordination · Impact tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => queryClient.invalidateQueries({ queryKey: ["donations"] })}>
              <RefreshCw size={14} className="mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </FadeUp>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem><StatsCard label="Total Donated" value={`${Math.round(totalDonated)} kg`} sublabel="All time" /></StaggerItem>
        <StaggerItem><StatsCard label="Meals Provided" value={String(totalMeals)} sublabel="All time" /></StaggerItem>
        <StaggerItem><StatsCard label="Active Pickups" value={String(activePickups)} sublabel={activePickups ? "Pending" : "None"} /></StaggerItem>
        <StaggerItem><StatsCard label="NGOs Served" value={String(ngos?.ngos?.length ?? 0)} sublabel="Verified partners" /></StaggerItem>
      </StaggerContainer>

      {surplus && (
        <FadeUp>
          <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-title-sm text-bmw-ink">Today&apos;s Surplus Prediction</h2>
              <Badge variant="info">AI Estimated</Badge>
            </div>
            <div className="rounded-card p-5" style={{ background: "color-mix(in srgb, var(--color-accent) 5%, var(--color-bg-soft))" }}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-light text-bmw-muted">Expected Surplus</span>
                  <span className="text-display-sm text-bmw-ink">{surplus.expectedSurplus} kg</span>
                  <span className="text-xs font-light text-bmw-muted">Ready approximately {surplus.readyAt}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button variant="primary" size="sm">
                    Create Donation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      )}

      <AnimatePresence>
        {showQR && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-card border border-bmw-hairline bg-bmw-canvas p-8 shadow-card-hover"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-title-sm text-bmw-ink">Donation QR Code</h2>
                <button onClick={() => setShowQR(null)} className="rounded-btn p-1 text-bmw-muted transition-colors hover:text-bmw-ink">
                  <X size={18} />
                </button>
              </div>
              <img src={showQR} alt="Donation QR Code" className="h-64 w-64" />
              <p className="mt-4 text-center text-xs text-bmw-muted">
                Scan to verify pickup and delivery
              </p>
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" onClick={() => setShowQR(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDonation && !showQR && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-card border border-bmw-hairline bg-bmw-canvas p-6 shadow-card-hover"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-title-sm text-bmw-ink">Donation Details</h2>
                <button onClick={() => setSelectedId(null)} className="rounded-btn p-1 text-bmw-muted transition-colors hover:text-bmw-ink">
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <DetailRow label="Status" value={<Badge variant={selectedDonation.status === "delivered" || selectedDonation.status === "verified" ? "success" : selectedDonation.status === "picked_up" ? "warning" : selectedDonation.status === "matched" ? "info" : "default"}>{selectedDonation.status}</Badge>} />
                <DetailRow label="NGO" value={selectedDonation.ngo?.name || "Unassigned"} />
                <DetailRow label="Weight" value={`${selectedDonation.weightKg} kg`} />
                <DetailRow label="Meals" value={String(selectedDonation.mealEquivalent)} />
                <DetailRow label="Dish" value={selectedDonation.foodBatch?.dish?.name} />
                {selectedDonation.volunteer && <DetailRow label="Volunteer" value={selectedDonation.volunteer.name} />}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedDonation.status === "pending" && (
                  <Button variant="primary" size="sm" onClick={() => handleGenerateQR(selectedDonation)}>
                    Generate QR & Match
                  </Button>
                )}
                {selectedDonation.status === "matched" && (
                  <Button variant="primary" size="sm" onClick={() => handlePickup(selectedDonation.id)}>
                    Mark Picked Up
                  </Button>
                )}
                {selectedDonation.status === "picked_up" && (
                  <Button variant="primary" size="sm" onClick={() => handleDeliver(selectedDonation.id)}>
                    Mark Delivered
                  </Button>
                )}
                {selectedDonation.status === "delivered" && (
                  <Button variant="primary" size="sm" onClick={() => handleVerify(selectedDonation.id)}>
                    Verify Donation
                  </Button>
                )}
                {(selectedDonation.status === "matched" || selectedDonation.status === "picked_up" || selectedDonation.status === "delivered") && (
                  <Button variant="secondary" size="sm" onClick={async () => {
                    const dataUrl = await generateDonationQR(selectedDonation.id, selectedDonation.ngo?.name || "Unknown NGO", selectedDonation.weightKg)
                    setShowQR(dataUrl)
                  }}>
                    View QR Code
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
              </div>
              {updateMutation.isPending && (
                <motion.p className="mt-3 text-xs text-bmw-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Updating...</motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FadeUp delay={0.1}>
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-sm text-bmw-ink">Active Donations</h2>
            <Badge variant="warning">{activePickups} Active</Badge>
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1,2,3].map((i) => <div key={i} className="skeleton h-14 rounded-btn" />)}
            </div>
          ) : donations?.donations?.length ? (
            <div className="flex flex-col gap-2">
              {donations.donations
                .filter((d) => d.status !== "verified")
                .map((d, i) => (
                  <motion.div
                    key={d.id}
                    className="flex cursor-pointer items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3 transition-all duration-200 hover:border-accent/30"
                    onClick={() => setSelectedId(d.id)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-bmw-ink">{d.ngo?.name || "Unassigned"}</span>
                        <StatusIndicator status={d.status} />
                      </div>
                      <span className="text-xs font-light text-bmw-muted">
                        {d.foodBatch?.dish?.name} · {d.weightKg}kg · {d.mealEquivalent} meals
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-bmw-muted">{d.createdAt.slice(0, 10)}</span>
                      <Badge variant={d.status === "verified" || d.status === "delivered" ? "success" : d.status === "picked_up" ? "warning" : d.status === "matched" ? "info" : "default"}>
                        {d.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm font-light text-bmw-muted">No donations yet</div>
          )}
        </div>
      </FadeUp>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FadeUp delay={0.15}>
          <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
            <h2 className="mb-4 text-title-sm text-bmw-ink">All Donations</h2>
            {donations?.donations?.length ? (
              <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                {donations.donations.map((d, i) => (
                  <motion.div
                    key={d.id}
                    className="flex cursor-pointer items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-2.5 transition-all duration-200 hover:border-accent/30"
                    onClick={() => setSelectedId(d.id)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-bmw-muted">{d.createdAt.slice(0, 10)}</span>
                      <span className="text-sm font-bold text-bmw-ink">{d.ngo?.name || "Unassigned"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-bmw-muted">{d.weightKg}kg</span>
                      <Badge variant={d.status === "verified" || d.status === "delivered" ? "success" : "default"}>
                        {d.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm font-light text-bmw-muted">No donations yet</div>
            )}
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
            <h2 className="mb-4 text-title-sm text-bmw-ink">Impact Summary</h2>
            <div className="flex flex-col gap-4">
              <ImpactRow icon={<Leaf size={14} />} label="CO₂ Avoided" value={`${Math.round(totalDonated * 3.5)} kg`} sublabel="Equivalent to tree planting" />
              <ImpactRow icon={<Heart size={14} />} label="Water Saved" value={`${Math.round(totalDonated * 1000)} L`} sublabel="Virtual water footprint" />
              <ImpactRow icon={<TrendingDown size={14} />} label="Landfill Reduction" value={`${Math.round(totalDonated)} kg`} sublabel="Waste diverted" />
              <ImpactRow icon={<Globe size={14} />} label="Meals Donated" value={String(totalMeals)} sublabel="People fed" />
            </div>
          </div>
        </FadeUp>
      </div>

      <FadeUp delay={0.25}>
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card">
          <h2 className="mb-4 text-title-sm text-bmw-ink">Donation Workflow Status</h2>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-[400px]">
              {(["pending", "matched", "picked_up", "delivered", "verified"] as const).map((stage, i) => {
                const count = donations?.donations?.filter((d) => d.status === stage).length ?? 0
                return (
                  <motion.div
                    key={stage}
                    className="flex-1 rounded-btn border border-bmw-hairline bg-bmw-surface-soft p-4 text-center transition-all duration-200 hover:border-accent/30"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="text-[clamp(1.25rem,2vw,1.75rem)] font-bold text-accent">{count}</div>
                    <div className="mt-1 text-xs font-light capitalize text-bmw-muted">{stage.replace("_", " ")}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </FadeUp>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center border-b border-bmw-hairline pb-2">
      <span className="text-xs uppercase tracking-uppercase text-bmw-muted">{label}</span>
      <span className="text-sm font-bold text-bmw-ink">{value}</span>
    </div>
  )
}

function StatusIndicator({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-warning",
    matched: "bg-accent",
    picked_up: "bg-warning",
    delivered: "bg-success",
    verified: "bg-success",
  }
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[status] || "bg-bmw-muted"}`} />
}

function ImpactRow({ icon, label, value, sublabel }: { icon: React.ReactNode; label: string; value: string; sublabel: string }) {
  return (
    <div className="flex items-center justify-between border-b border-bmw-hairline pb-3 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-bmw-ink">{value}</span>
          <span className="text-xs font-light text-bmw-muted">{label}</span>
        </div>
      </div>
      <span className="text-xs font-light text-bmw-muted">{sublabel}</span>
    </div>
  )
}
