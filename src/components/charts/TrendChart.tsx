"use client";

/**
 * TrendChart — reusable multi-series line chart.
 *
 * Configurable series with colors and labels. Any card that needs a trend
 * visualization can use this component.
 *
 * Accessibility: chart div is aria-hidden (decorative). The consuming card
 * must provide an accessible alternative (sr-only data table or aria-label).
 *
 * Responsive: uses ResponsiveContainer to fill parent width. No horizontal scroll.
 * Y-axis anchored at 0 (domain={[0, 'auto']}) to prevent misleading non-zero baselines.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

export interface ChartDataPoint {
  quarter: string;
  [key: string]: string | number;
}

export type FormatType = "currency-thousands" | "percent" | "number";

interface TrendChartProps {
  /** Data points — each object has a `quarter` key plus one key per series */
  data: ChartDataPoint[];
  /** Series configuration — key matches a field in data, label for legend, color for line */
  series: ChartSeries[];
  /** Format type for Y-axis and tooltip values */
  formatType?: FormatType;
  /** Chart height in pixels (default: 200) */
  height?: number;
}

export function TrendChart({
  data,
  series,
  formatType = "currency-thousands",
  height = 200,
}: TrendChartProps) {
  const formatValue = FORMAT_FUNCTIONS[formatType];
  return (
    <div aria-hidden="true">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="quarter"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            domain={[0, "auto"]}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            tickFormatter={formatValue}
            width={60}
          />
          <Tooltip
            formatter={(value: number) => formatValue(value)}
            labelStyle={{ fontSize: 11, color: "#374151" }}
            contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e5e7eb" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="line"
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function defaultFormat(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function percentFormat(value: number): string {
  return `${value.toFixed(2)}%`;
}

function numberFormat(value: number): string {
  return value.toLocaleString();
}

const FORMAT_FUNCTIONS: Record<FormatType, (value: number) => string> = {
  "currency-thousands": defaultFormat,
  percent: percentFormat,
  number: numberFormat,
};
