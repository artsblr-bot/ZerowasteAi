"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface WasteData {
  name: string
  value: number
  color: string
}

export function WastePieChart({ data }: { data: WasteData[] }) {
  if (!data.length) return null

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex flex-col items-center">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                fontSize: 12,
                background: "var(--color-bg)",
                boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
              }}
              formatter={(value) => [`${value} servings (${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%)`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-5 text-xs">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
          return (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-bmw-muted">{d.name}</span>
              <span className="font-bold text-bmw-ink">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
