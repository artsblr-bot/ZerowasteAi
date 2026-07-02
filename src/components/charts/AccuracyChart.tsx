"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface AccuracyPoint {
  date: string
  predicted: number
  actual: number
  confidence: number
}

export function AccuracyChart({ data }: { data: AccuracyPoint[] }) {
  if (!data.length) return null

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)", strokeOpacity: 0.5 }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              fontSize: 12,
              background: "var(--color-bg)",
              boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
            dot={false}
            name="Predicted"
            strokeDasharray="4 3"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#22c55e", strokeWidth: 2, stroke: "var(--color-bg)" }}
            name="Actual"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
