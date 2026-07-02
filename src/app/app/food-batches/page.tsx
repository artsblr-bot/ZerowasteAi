"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { motion } from "framer-motion"
import { FadeUp } from "@/components/motion/MotionComponents"
import { Plus, Check, Clock, ChefHat, TrendingUp, X } from "lucide-react"

export default function FoodBatchesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ dishId: "", quantityPrepared: "", quantitySold: "" })

  const { data: menuData } = useQuery({
    queryKey: ["menu"],
    queryFn: () => api.menu.list(),
  })

  const dishes = menuData?.menus?.flatMap((m: any) => m.dishes) ?? []

  const { data: todayBatches } = useQuery({
    queryKey: ["food-batches-today"],
    queryFn: async () => {
      const res = await fetch("/api/food-batches", { credentials: "include" })
      if (!res.ok) return []
      const data = await res.json()
      return data.batches || []
    },
  })

  const addBatch = useMutation({
    mutationFn: async (data: { dishId: string; quantityPrepared: number; quantitySold: number }) => {
      const res = await fetch("/api/food-batches", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create batch")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-batches"] })
      queryClient.invalidateQueries({ queryKey: ["predictions-surplus"] })
      queryClient.invalidateQueries({ queryKey: ["restaurant-stats"] })
      setShowForm(false)
      setForm({ dishId: "", quantityPrepared: "", quantitySold: "" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.dishId) return
    addBatch.mutate({
      dishId: form.dishId,
      quantityPrepared: parseInt(form.quantityPrepared) || 0,
      quantitySold: parseInt(form.quantitySold) || 0,
    })
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-sm text-bmw-ink">Daily Production</h1>
            <p className="mt-1 text-sm font-light text-bmw-muted">
              Record what you cooked and sold today
            </p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            className="flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold text-black"
            style={{ background: "#22c55e" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={14} />
            Add Batch
          </motion.button>
        </div>
      </FadeUp>

      {showForm && (
        <motion.div
          className="rounded-card border border-bmw-hairline bg-bmw-canvas p-6 shadow-card"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-sm text-bmw-ink">Record Production</h2>
            <button onClick={() => setShowForm(false)} className="text-bmw-muted hover:text-bmw-ink">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-bmw-muted">Dish</label>
              <select
                value={form.dishId}
                onChange={(e) => setForm({ ...form, dishId: e.target.value })}
                className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none"
                required
              >
                <option value="">Select a dish</option>
                {dishes.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-bmw-muted">Quantity Prepared</label>
                <input
                  type="number"
                  value={form.quantityPrepared}
                  onChange={(e) => setForm({ ...form, quantityPrepared: e.target.value })}
                  className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-bmw-muted">Quantity Sold</label>
                <input
                  type="number"
                  value={form.quantitySold}
                  onChange={(e) => setForm({ ...form, quantitySold: e.target.value })}
                  className="h-11 rounded-xl border border-bmw-hairline bg-bmw-surface-soft px-4 text-sm text-bmw-ink outline-none"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={addBatch.isPending}
              className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-black transition-all"
              style={{ background: "#22c55e" }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {addBatch.isPending ? "Saving..." : <><Check size={14} /> Save Batch</>}
            </motion.button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <ChefHat size={16} className="text-accent" />
            <h2 className="text-title-sm text-bmw-ink">How It Works</h2>
          </div>
          <div className="flex flex-col gap-3 text-sm text-bmw-muted">
            <p>1. <strong className="text-bmw-ink">Add dishes</strong> to your menu from the Menu page</p>
            <p>2. <strong className="text-bmw-ink">Record daily batches</strong> — what you cooked and sold</p>
            <p>3. The AI uses this data to <strong className="text-bmw-ink">predict demand</strong> and reduce waste</p>
            <p>4. Mark leftover food for <strong className="text-bmw-ink">donation</strong> from the Donations page</p>
          </div>
          <div className="mt-4 rounded-btn p-3" style={{ background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}>
            <p className="text-xs text-accent">
              Tip: Record production daily for the most accurate predictions
            </p>
          </div>
        </div>

        <div className="rounded-card border border-bmw-hairline bg-bmw-canvas p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            <h2 className="text-title-sm text-bmw-ink">Todays Summary</h2>
          </div>
          {!dishes.length ? (
            <div className="py-8 text-center text-sm font-light text-bmw-muted">
              Add some dishes to your menu first
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3">
                <span className="text-sm text-bmw-muted">Active Dishes</span>
                <span className="text-sm font-bold text-bmw-ink">{dishes.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-btn border border-bmw-hairline bg-bmw-surface-soft px-4 py-3">
                <span className="text-sm text-bmw-muted">Today&apos;s Batches</span>
                <span className="text-sm font-bold text-bmw-ink">{todayBatches?.length || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
