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

interface Prediction {
  predictedNextMonth: number;
  confidence: string;
}

interface AnomalyResult {
  id: number;
  amount: number;
  categoryName: string;
  transactionDate: string;
  isAnomaly: boolean;
  reason: string | null;
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

const CONFIDENCE_LABEL: Record<string, string> = {
  tinggi: "Keyakinan Tinggi",
  sedang: "Keyakinan Sedang",
  rendah: "Keyakinan Rendah (data masih sedikit)",
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [trend, setTrend] = useState<MonthlySummary[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [mlLoading, setMlLoading] = useState(true);

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

    const loadMl = async () => {
      setMlLoading(true);
      try {
        const [predictRes, anomalyRes] = await Promise.all([
          api.get("/ml/predict", { params: { monthsBack: 6 } }),
          api.get("/ml/anomaly"),
        ]);
        setPrediction(predictRes.data);
        setAnomalies(anomalyRes.data.anomalies.filter((a: AnomalyResult) => a.isAnomaly));
      } catch {
        // ML service mungkin belum jalan / belum cukup data — biarkan section-nya kosong, jangan crash halaman
        setPrediction(null);
        setAnomalies([]);
      } finally {
        setMlLoading(false);
      }
    };

    loadCharts();
    loadMl();
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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
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

      {/* Prediksi & Anomali */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Prediksi Pengeluaran */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--color-primary-dark)] dark:text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <p className="text-sm font-semibold text-[var(--foreground)]">Prediksi Bulan Depan</p>
          </div>
          {mlLoading ? (
            <div className="h-12 flex items-center">
              <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : prediction ? (
            <>
              <p className="text-2xl font-bold text-[var(--foreground)]">{formatRupiah(prediction.predictedNextMonth)}</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                {CONFIDENCE_LABEL[prediction.confidence] || prediction.confidence}
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">Belum cukup data untuk prediksi.</p>
          )}
        </div>

        {/* Deteksi Anomali */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M4.5 19.5h15a2.25 2.25 0 001.984-3.3l-7.5-13.5a2.25 2.25 0 00-3.968 0l-7.5 13.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            <p className="text-sm font-semibold text-[var(--foreground)]">Transaksi Tidak Biasa</p>
          </div>
          {mlLoading ? (
            <div className="h-12 flex items-center">
              <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : anomalies.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">Tidak ada transaksi mencurigakan terdeteksi.</p>
          ) : (
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {anomalies.slice(0, 3).map((a) => (
                <div key={a.id} className="text-xs">
                  <p className="font-medium text-[var(--foreground)]">
                    {a.categoryName} — {formatRupiah(a.amount)}
                  </p>
                  <p className="text-[var(--color-muted)]">{a.reason}</p>
                </div>
              ))}
              {anomalies.length > 3 && (
                <p className="text-xs text-[var(--color-muted)]">+{anomalies.length - 3} lainnya</p>
              )}
            </div>
          )}
        </div>
      </div>

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
                  <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
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