"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "@/lib/axios";
import { useAuth } from "@/components/AuthProvider";
import { PageHeader } from "@/components/PageHeader";

interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
}

interface CategoryBreakdown {
  categoryName: string;
  icon: string;
  color: string;
  total: number;
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatCompact(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}rb`;
  return String(amount);
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [trend, setTrend] = useState<MonthlySummary[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const loadCharts = async () => {
      setChartLoading(true);
      try {
        const [trendRes, breakdownRes] = await Promise.all([
          api.get("/dashboard/trend", { params: { monthsBack: 6 } }),
          api.get("/dashboard/breakdown", { params: { month: now.getMonth() + 1, year: now.getFullYear() } }),
        ]);
        setTrend(trendRes.data);
        setBreakdown(breakdownRes.data);
      } finally {
        setChartLoading(false);
      }
    };
    loadCharts();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const chartData = trend.map((t) => ({
    name: MONTH_SHORT[t.month - 1],
    Pemasukan: t.totalIncome,
    Pengeluaran: t.totalExpense,
  }));

  const thisMonth = trend[trend.length - 1];
  const totalBreakdown = breakdown.reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="w-full px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Halo, ${user?.fullName || "Pengguna"}`}
        subtitle="Selamat datang kembali di dashboard keuanganmu."
      />

      {/* Ringkasan Bulan Ini */}
      {thisMonth && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[var(--color-muted)] font-medium">Pemasukan Bulan Ini</p>
              <p className="text-base sm:text-lg font-bold text-[var(--foreground)] truncate">
                {formatRupiah(thisMonth.totalIncome)}
              </p>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[var(--color-muted)] font-medium">Pengeluaran Bulan Ini</p>
              <p className="text-base sm:text-lg font-bold text-rose-500 truncate">
                {formatRupiah(thisMonth.totalExpense)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Grafik Tren 6 Bulan */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Tren 6 Bulan Terakhir
          </h2>

          {chartLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[var(--color-muted)]">Memuat data grafik...</p>
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatCompact} width={40} />
                  <Tooltip
                    formatter={(value: any) => formatRupiah(Number(value))}
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Bar dataKey="Pemasukan" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Grafik Breakdown Kategori */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Pengeluaran per Kategori (Bulan Ini)
          </h2>

          {chartLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[var(--color-muted)]">Memuat data kategori...</p>
            </div>
          ) : breakdown.length === 0 ? (
            <div className="h-64 border border-dashed border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-2.5 text-lg">
                📊
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Belum Ada Pengeluaran</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">Data pengeluaran bulan ini akan muncul di sini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="total"
                      nameKey="categoryName"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {breakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatRupiah(Number(value))}
                      contentStyle={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List Kategori */}
              <div className="divide-y divide-[var(--color-border)] max-h-40 overflow-y-auto pr-1">
                {breakdown.map((b, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                      <span className="text-[var(--foreground)] font-medium truncate">
                        {b.icon} {b.categoryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="font-semibold text-[var(--foreground)]">{formatRupiah(b.total)}</span>
                      <span className="text-[var(--color-muted)] font-medium w-9 text-right">
                        {((b.total / totalBreakdown) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}