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
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title={`Halo, ${user?.fullName}`}
        subtitle="Selamat datang kembali di dashboard keuanganmu."
      />

      {/* Ringkasan bulan ini */}
      {thisMonth && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
            <p className="text-xs text-[var(--color-muted)]">Pemasukan Bulan Ini</p>
            <p className="text-xl font-bold text-[var(--color-accent-dark)] mt-1">{formatRupiah(thisMonth.totalIncome)}</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
            <p className="text-xs text-[var(--color-muted)]">Pengeluaran Bulan Ini</p>
            <p className="text-xl font-bold text-red-500 mt-1">{formatRupiah(thisMonth.totalExpense)}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Grafik Tren 6 Bulan */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Tren 6 Bulan Terakhir</h2>
          {chartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCompact} width={45} />
                <Tooltip
                 formatter={(value: any) => formatRupiah(Number(value))}
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Pemasukan" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Grafik Breakdown Kategori */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Pengeluaran per Kategori (Bulan Ini)</h2>
          {chartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : breakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-[var(--color-muted)]">Belum ada pengeluaran bulan ini.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="total"
                    nameKey="categoryName"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {breakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatRupiah(Number(value))}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {breakdown.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-[var(--foreground)]">{b.icon} {b.categoryName}</span>
                    </div>
                    <span className="text-[var(--color-muted)]">
                      {((b.total / totalBreakdown) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}