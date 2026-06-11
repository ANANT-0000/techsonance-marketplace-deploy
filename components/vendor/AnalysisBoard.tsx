"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Download,
  IndianRupee,
  ShoppingBag,
  Percent,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Package,
  CalendarIcon,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  Minus,
} from "lucide-react";
import {
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  subMonths,
  subDays,
  differenceInDays,
} from "date-fns";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useAnalyticsDownload } from "@/hooks/useAnalyticsDownload";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyTrendItem {
  month: string;
  sortDate: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  sku: string;
  revenue: number;
}

interface CategoryPerformance {
  name: string;
  value: number;
}

interface AnalyticsSummary {
  grossRevenue: number;
  totalOrders: number;
  taxCollected: number;
  refunds: number;
  platformFees: number;
  netEarnings: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  monthlyTrend: MonthlyTrendItem[];
  topProducts: TopProduct[];
  categoryPerformance: CategoryPerformance[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ["#378ADD", "#1D9E75", "#7F77DD", "#BA7517", "#D85A30"];

type PresetKey = "7d" | "30d" | "90d" | "mtd" | "ytd" | "custom";

interface Preset {
  label: string;
  key: PresetKey;
  range: () => { startDate: Date; endDate: Date };
}

const PRESETS: Preset[] = [
  {
    label: "Last 7 days",
    key: "7d",
    range: () => ({ startDate: subDays(new Date(), 6), endDate: new Date() }),
  },
  {
    label: "Last 30 days",
    key: "30d",
    range: () => ({ startDate: subDays(new Date(), 29), endDate: new Date() }),
  },
  {
    label: "Last 90 days",
    key: "90d",
    range: () => ({ startDate: subDays(new Date(), 89), endDate: new Date() }),
  },
  {
    label: "This month",
    key: "mtd",
    range: () => ({ startDate: startOfMonth(new Date()), endDate: new Date() }),
  },
  {
    label: "This year",
    key: "ytd",
    range: () => ({ startDate: startOfYear(new Date()), endDate: new Date() }),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtINR(value: number): string {
  return "₹" + Math.round(value).toLocaleString("en-IN");
}

function fmtShort(value: number): string {
  if (value >= 1_00_000) return "₹" + (value / 1_00_000).toFixed(1) + "L";
  if (value >= 1_000) return "₹" + (value / 1_000).toFixed(1) + "k";
  return "₹" + value;
}

// ─── Date Range Picker ────────────────────────────────────────────────────────

interface DatePickerProps {
  startDate: Date;
  endDate: Date;
  activePreset: PresetKey;
  onSelect: (start: Date, end: Date, preset: PresetKey) => void;
}

function DateRangePicker({
  startDate,
  endDate,
  activePreset,
  onSelect,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange>({
    from: startDate,
    to: endDate,
  });

  const applyPreset = (preset: Preset) => {
    const { startDate: s, endDate: e } = preset.range();
    setRange({ from: s, to: e });
    onSelect(s, e, preset.key);
    setOpen(false);
  };

  const applyCustom = () => {
    if (range?.from && range?.to) {
      onSelect(range.from, range.to, "custom");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 text-sm font-normal"
        >
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">
            {format(startDate, "MMM d, yyyy")} —{" "}
            {format(endDate, "MMM d, yyyy")}
          </span>
          <span className="sm:hidden">
            {activePreset !== "custom"
              ? PRESETS.find((p) => p.key === activePreset)?.label
              : format(startDate, "MMM d") + " — " + format(endDate, "MMM d")}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col sm:flex-row">
          {/* Presets sidebar */}
          <div className="flex sm:flex-col gap-1 p-3 border-b sm:border-b-0 sm:border-r border-gray-300  sm:w-36">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1 hidden sm:block">
              Quick select
            </p>
            {PRESETS.map((preset) => (
              <button
                key={preset.key}
                onClick={() => applyPreset(preset)}
                className={cn(
                  "text-left text-xs px-2.5 py-1.5 rounded-md transition-colors w-full",
                  activePreset === preset.key
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(r) => r && setRange(r)}
              numberOfMonths={2}
              toDate={new Date()}
              initialFocus
            />
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-300 ">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={applyCustom}
                disabled={!range?.from || !range?.to}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconColor: string;
  trend?: { label: string; positive: boolean | null };
}

function MetricCard({
  title,
  value,
  sub,
  icon,
  iconColor,
  trend,
}: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-none">
            {title}
          </p>
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconColor}`}
          >
            {icon}
          </div>
        </div>
        <p className="text-2xl font-semibold tracking-tight text-foreground leading-none mb-1.5">
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 mt-2 text-xs font-medium",
              trend.positive === true && "text-emerald-600",
              trend.positive === false && "text-rose-500",
              trend.positive === null && "text-muted-foreground",
            )}
          >
            {trend.positive === true && <ArrowUpRight className="h-3 w-3" />}
            {trend.positive === false && <TrendingDown className="h-3 w-3" />}
            {trend.positive === null && <Minus className="h-3 w-3" />}
            {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-gray-300  rounded-lg shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-medium mb-2 text-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      {payload.map((entry: any) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="w-2 h-2 rounded-sm inline-block flex-shrink-0"
              style={{ background: entry.color }}
            />
            {entry.name === "revenue" ? "Revenue" : "Orders"}
          </span>
          <span className="font-semibold text-foreground">
            {entry.name === "revenue" ? fmtINR(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-popover border border-gray-300  rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium capitalize text-foreground">{entry.name}</p>
      <p className="text-muted-foreground mt-0.5">{fmtINR(entry.value)}</p>
    </div>
  );
}

// ─── SKU Bars ─────────────────────────────────────────────────────────────────

function SkuBars({ products }: { products: TopProduct[] }) {
  const total = products.reduce((a, p) => a + p.revenue, 0);
  const maxRev = Math.max(...products.map((p) => p.revenue), 1);

  return (
    <div className="space-y-4">
      {products.map((product, i) => {
        const pct = Math.round((product.revenue / maxRev) * 100);
        const sharePct =
          total > 0 ? ((product.revenue / total) * 100).toFixed(1) : "0";
        const color = COLORS[i % COLORS.length];
        return (
          <div key={product.sku}>
            <div className="flex justify-between items-baseline mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span
                  className="text-xs font-mono text-muted-foreground truncate"
                  title={product.sku}
                >
                  {product.sku}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <span className="text-xs text-muted-foreground">
                  {sharePct}%
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {fmtINR(product.revenue)}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}

      {/* Total row */}
      <div className="pt-3 mt-1 border-t border-gray-300  flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Total (top {products.length})
        </span>
        <span className="text-sm font-semibold text-foreground">
          {fmtINR(total)}
        </span>
      </div>
    </div>
  );
}

// ─── P&L Breakdown ────────────────────────────────────────────────────────────

function PnLBreakdown({ summary }: { summary: AnalyticsSummary }) {
  const grossRev = summary.grossRevenue;
  const deductions =
    summary.platformFees + summary.taxCollected + summary.refunds;
  const netPct =
    grossRev > 0 ? ((summary.netEarnings / grossRev) * 100).toFixed(1) : "0";

  const lines = [
    {
      label: "Gross sales",
      value: fmtINR(grossRev),
      amount: grossRev,
      deduct: false,
    },
    {
      label: "Platform fees",
      value: `− ${fmtINR(summary.platformFees)}`,
      amount: summary.platformFees,
      deduct: true,
    },
    {
      label: "GST / tax",
      value: `− ${fmtINR(summary.taxCollected)}`,
      amount: summary.taxCollected,
      deduct: true,
    },
    {
      label: "Refunds",
      value: `− ${fmtINR(summary.refunds)}`,
      amount: summary.refunds,
      deduct: true,
    },
  ];

  return (
    <div className="space-y-1">
      {lines.map((line) => (
        <div
          key={line.label}
          className="flex justify-between items-center py-2.5 border-b border-gray-300  last:border-0"
        >
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            {line.deduct && line.amount > 0 && (
              <TrendingDown className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
            )}
            {line.label}
          </span>
          <span
            className={cn(
              "text-sm font-medium tabular-nums",
              line.deduct && line.amount > 0
                ? "text-rose-500"
                : "text-foreground",
            )}
          >
            {line.value}
          </span>
        </div>
      ))}

      {/* Net bar */}
      <div className="pt-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Net profit</span>
          <span className="text-lg font-bold text-emerald-600 tabular-nums">
            {fmtINR(summary.netEarnings)}
          </span>
        </div>
        {/* Visual margin bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Margin</span>
            <span className="font-medium text-emerald-600">{netPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(parseFloat(netPct), 100)}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground pt-1">
          <span>Total deductions</span>
          <span className="text-rose-500 font-medium">
            {fmtINR(deductions)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Derived Insights ─────────────────────────────────────────────────────────

function InsightRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-300  last:border-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span
          className={`h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 ${color}`}
        >
          {icon}
        </span>
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}

function DerivedInsights({
  summary,
  dateRange,
  topProducts,
  categoryPerformance,
}: {
  summary: AnalyticsSummary;
  dateRange: { startDate: Date; endDate: Date };
  topProducts: TopProduct[];
  categoryPerformance: CategoryPerformance[];
}) {
  const days = Math.max(
    differenceInDays(dateRange.endDate, dateRange.startDate),
    1,
  );
  const aov =
    summary.totalOrders > 0 ? summary.grossRevenue / summary.totalOrders : 0;
  const revenuePerDay = summary.grossRevenue / days;
  const topCategory = [...categoryPerformance].sort(
    (a, b) => b.value - a.value,
  )[0];
  const taxSlab =
    summary.grossRevenue > 0
      ? ((summary.taxCollected / summary.grossRevenue) * 100).toFixed(1)
      : "0";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Derived Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <InsightRow
          icon={<IndianRupee className="h-3.5 w-3.5 text-blue-600" />}
          label="Avg. order value"
          value={fmtINR(aov)}
          color="bg-blue-50 light:bg-blue-950"
        />
        <InsightRow
          icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}
          label="Revenue per day"
          value={fmtINR(revenuePerDay)}
          color="bg-emerald-50 light:bg-emerald-950"
        />
        <InsightRow
          icon={<ShoppingBag className="h-3.5 w-3.5 text-violet-600" />}
          label={`Orders over ${days} days`}
          value={`${summary.totalOrders} orders`}
          color="bg-violet-50 light:bg-violet-950"
        />
        <InsightRow
          icon={<Percent className="h-3.5 w-3.5 text-amber-600" />}
          label="Effective tax rate"
          value={`${taxSlab}%`}
          color="bg-amber-50 light:bg-amber-950"
        />
        {topCategory && (
          <InsightRow
            icon={<Package className="h-3.5 w-3.5 text-rose-600" />}
            label="Best category"
            value={
              topCategory.name.charAt(0).toUpperCase() +
              topCategory.name.slice(1)
            }
            color="bg-rose-50 light:bg-rose-950"
          />
        )}
        {topProducts[0] && (
          <InsightRow
            icon={<ArrowUpRight className="h-3.5 w-3.5 text-teal-600" />}
            label="Top SKU"
            value={topProducts[0].sku}
            color="bg-teal-50 light:bg-teal-950"
          />
        )}
      </CardContent>
    </Card>
  );
}

function DonutChart({
  data,
  total,
}: {
  data: CategoryPerformance[];
  total: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(220);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setSize(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = Math.floor(size * 0.37);
  const innerR = Math.floor(size * 0.26);

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height: size }}>
      {/* Center label — absolutely positioned, never affects SVG layout */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
        aria-hidden="true"
      >
        <span className="text-lg font-bold text-foreground leading-none">
          {fmtShort(total)}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">total</span>
      </div>

      {/* Fixed-pixel chart — bypasses ResponsiveContainer collapse during PDF export */}
      <PieChart width={size} height={size} style={{ display: "block" }}>
        <Pie
          data={data}
          cx={cx}
          cy={cy}
          innerRadius={innerR}
          outerRadius={outerR}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          strokeWidth={0}
          isAnimationActive={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip content={<PieTooltip />} />
      </PieChart>
    </div>
  );
}
// ─── Category Table ───────────────────────────────────────────────────────────

function CategoryTable({ data }: { data: CategoryPerformance[] }) {
  const total = data.reduce((a, c) => a + c.value, 0);
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full">
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-gray-300 ">
        <span>Category</span>
        <span className="text-right">Revenue</span>
        <span className="text-right w-10">Share</span>
      </div>
      <div className="divide-y divide-border">
        {sorted.map((cat, i) => {
          const share =
            total > 0 ? ((cat.value / total) * 100).toFixed(1) : "0";
          return (
            <div
              key={cat.name}
              className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center py-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="text-sm capitalize truncate">{cat.name}</span>
              </div>
              <span className="text-sm font-semibold text-right tabular-nums">
                {fmtINR(cat.value)}
              </span>
              <div className="flex items-center gap-1.5 justify-end w-14">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {share}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pt-3 flex justify-between border-t border-grey-200  text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-bold">{fmtINR(total)}</span>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="lg:col-span-2 h-[340px] rounded-xl" />
        <Skeleton className="h-[340px] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="h-[280px] rounded-xl" />
        <Skeleton className="h-[280px] rounded-xl" />
        <Skeleton className="h-[280px] rounded-xl" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalysisBoard() {
  const { downloadAnalyticsPdf, isGenerating } = useAnalyticsDownload();
  const [activePreset, setActivePreset] = useState<PresetKey>("30d");
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 29),
    endDate: new Date(),
  });
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  const token = authToken();

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await AxiosAPI.get(
        `/v1/vendors/analytics?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setData(response.data.data as AnalyticsData);
    } catch (err) {
      console.error("[AnalysisBoard] Failed to fetch analytics:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [dateRange, token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDateSelect = (start: Date, end: Date, preset: PresetKey) => {
    setActivePreset(preset);
    setDateRange({ startDate: start, endDate: end });
    // fetchAnalytics will be triggered by the dateRange useEffect above
  };

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-64 text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm">Failed to load analytics. Please try again.</p>
        <Button variant="outline" size="sm" onClick={fetchAnalytics}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    );
  }

  const { summary, monthlyTrend, topProducts, categoryPerformance } = data;

  const marginPct =
    summary.grossRevenue > 0
      ? ((summary.netEarnings / summary.grossRevenue) * 100).toFixed(1)
      : "0.0";
  const catTotal = categoryPerformance.reduce((a, c) => a + c.value, 0);
  const days = Math.max(
    differenceInDays(dateRange.endDate, dateRange.startDate),
    1,
  );
  const aov =
    summary.totalOrders > 0 ? summary.grossRevenue / summary.totalOrders : 0;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Analytics Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Showing data for {days} day{days !== 1 ? "s" : ""}
            {" · "}Last updated {format(new Date(), "MMM d, h:mm a")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            activePreset={activePreset}
            onSelect={handleDateSelect}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
            className="h-9 px-3"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", loading && "animate-spin")}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            disabled={isPdfExporting}
            onClick={async () => {
              if (!token) return;
              setIsPdfExporting(true);
              try {
                await downloadAnalyticsPdf(
                  token,
                  dateRange.startDate,
                  dateRange.endDate,
                );
              } catch (e) {
                console.error("[AnalysisBoard] PDF export failed:", e);
              } finally {
                setIsPdfExporting(false);
              }
            }}
          >
            {isGenerating ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {isGenerating ? "Downloading…" : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* Printable content */}
      <div id="dashboard-report" className="flex flex-col gap-5">
        {/* ── Metric cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            title="Gross Revenue"
            value={fmtINR(summary.grossRevenue)}
            sub={`${summary.totalOrders} confirmed orders`}
            icon={<IndianRupee className="h-4 w-4 text-blue-600" />}
            iconColor="bg-blue-50 light:bg-blue-950"
          />
          <MetricCard
            title="Net Earnings"
            value={fmtINR(summary.netEarnings)}
            sub={`After all deductions`}
            icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
            iconColor="bg-emerald-50 light:bg-emerald-950"
            trend={{
              label: `${marginPct}% net margin`,
              positive: parseFloat(marginPct) > 0 ? true : null,
            }}
          />
          <MetricCard
            title="Avg. Order Value"
            value={fmtINR(aov)}
            sub={`Over ${days} days`}
            icon={<ShoppingBag className="h-4 w-4 text-violet-600" />}
            iconColor="bg-violet-50 light:bg-violet-950"
          />
          <MetricCard
            title="GST Collected"
            value={fmtINR(summary.taxCollected)}
            sub="CGST + SGST / IGST"
            icon={<Percent className="h-4 w-4 text-amber-600" />}
            iconColor="bg-amber-50 light:bg-amber-950"
            trend={{
              label:
                summary.grossRevenue > 0
                  ? `${((summary.taxCollected / summary.grossRevenue) * 100).toFixed(1)}% effective rate`
                  : "No revenue",
              positive: null,
            }}
          />
        </div>

        {/* ── Revenue trend + P&L ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  Revenue &amp; Order Trend
                </CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#378ADD] inline-block opacity-70" />
                    Revenue
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-5 h-0.5 bg-[#1D9E75] inline-block"
                      style={{
                        borderTop: "2px dashed #1D9E75",
                        background: "none",
                      }}
                    />
                    Orders
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyTrend}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="revenueGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#378ADD"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#378ADD"
                        stopOpacity={0.03}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    strokeOpacity={0.07}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="revenue"
                    orientation="left"
                    tickFormatter={fmtShort}
                    tick={{ fontSize: 10, fill: "#378ADD" }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <YAxis
                    yAxisId="orders"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#1D9E75" }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <RechartsTooltip
                    content={<TrendTooltip />}
                    cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
                  />
                  <Bar
                    yAxisId="revenue"
                    dataKey="revenue"
                    name="revenue"
                    fill="url(#revenueGrad)"
                    stroke="#378ADD"
                    strokeWidth={1.5}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    name="orders"
                    stroke="#1D9E75"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#1D9E75", strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    strokeDasharray="5 3"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Profit &amp; Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PnLBreakdown summary={summary} />
            </CardContent>
          </Card>
        </div>

        {/* ── Top SKUs + Category donut + Category table ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Top SKUs */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  Top Variants
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="text-xs font-mono font-normal"
                >
                  SKU
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <SkuBars products={topProducts} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No product data.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Donut chart */}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Revenue by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-4">
                {categoryPerformance.map((cat, i) => (
                  <span
                    key={cat.name}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span
                      className="w-2 h-2 rounded-sm inline-block flex-shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="capitalize">{cat.name}</span>
                    <span className="font-medium text-foreground">
                      {catTotal > 0
                        ? Math.round((cat.value / catTotal) * 100)
                        : 0}
                      %
                    </span>
                  </span>
                ))}
              </div>
              <DonutChart data={categoryPerformance} total={catTotal} />
            </CardContent>
          </Card>

          {/* Category breakdown table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryTable data={categoryPerformance} />
            </CardContent>
          </Card>
        </div>

        {/* ── Derived Insights ── */}
        <DerivedInsights
          summary={summary}
          dateRange={dateRange}
          topProducts={topProducts}
          categoryPerformance={categoryPerformance}
        />
      </div>
    </div>
  );
}
