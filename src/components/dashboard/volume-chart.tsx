"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function VolumeChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
        >
          <defs>
            <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--chart-grid)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              fontSize: 12,
              boxShadow: "var(--shadow-overlay)",
            }}
            labelStyle={{ color: "var(--muted-foreground)", fontWeight: 500 }}
            itemStyle={{ fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Enquiries"
            stroke="var(--chart-1)"
            strokeWidth={2.25}
            fill="url(#volumeFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
