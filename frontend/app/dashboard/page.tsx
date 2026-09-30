"use client";

import { useEffect, useState, useMemo } from "react";
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

// ==========================================
// TYPES & INTERFACES
// ==========================================
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

interface ScoreComponent {
  name: string;
  score: number;
  maxScore: number;
  description: string;
}

interface HealthScore {
  score: number;
  category: string;
  components: ScoreComponent[];
}

// ==========================================
// UTILS & CONSTANTS
// ==========================================
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const CONFIDENCE_LABEL: Record<string, string> = {
  tinggi: "Keyakinan Tinggi",
  sedang: "Keyakinan Sedang",
  rendah: "Keyakinan Rendah (data masih sedikit)",
};

const CARD_CLASS = "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xs transition-all duration-200";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

function formatCompact(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}rb`;
  return String(amount);
}

function getHealthColor(category: string) {
  switch (category) {
    case "Sangat Sehat":
    case "Sehat":
      return "var(--color-accent)";
    case "Perlu Perhatian":
      return "#f59e0b";
    default:
      return "#ef4444";
  }
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-[var(--color-border)]/50 rounded-lg ${className}`} />;
}

function BalanceCard({ thisMonth }: { thisMonth?: MonthlySummary }) {
  const balance = thisMonth ? thisMonth.totalIncome - thisMonth.totalExpense : 0;

  return (
    <div className="lg:col-span-2 rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-dark)] shadow-sm flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500" />
      <div>
        <span className="text-white/80 text-xs sm:text-sm font-medium tracking-wide uppercase">Saldo Bersih Bulan Ini</span>
        <p className="text-white text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
          {formatRupiah(balance)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold">
            ↓
          </div>
          <div>
            <p className="text-white/70 text-xs">Pemasukan</p>
            <p className="text-white font-semibold text-sm sm:text-base">{formatRupiah(thisMonth?.totalIncome || 0)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-300 font-bold">
            ↑
          </div>
          <div>
            <p className="text-white/70 text-xs">Pengeluaran</p>
            <p className="text-white font-semibold text-sm sm:text-base">{formatRupiah(thisMonth?.totalExpense || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthScoreCard({
  healthScore,
  healthLoading,
  healthExpanded,
  onToggleExpand,
}: {
  healthScore: HealthScore | null;
  healthLoading: boolean;
  healthExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const scoreColor = healthScore ? getHealthColor(healthScore.category) : "var(--color-muted)";
  const scorePct = Math.min(Math.max(healthScore ? healthScore.score : 0, 0), 100);
  const circumference = 2 * Math.PI * 34;
  const dashOffset = circumference - (scorePct / 100) * circumference;

  return (
    <div className={`${CARD_CLASS} p-4 sm:p-5 flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Skor Kesehatan</p>
          {healthScore && (
            <button
              onClick={onToggleExpand}
              className="text-xs font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity focus:outline-hidden"
            >
              {healthExpanded ? "Tutup" : "Detail"}
            </button>
          )}
        </div>

        {healthLoading ? (
          <div className="flex items-center gap-4 mt-3">
            <Skeleton className="w-[68px] h-[68px] rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : !healthScore ? (
          <p className="text-sm text-[var(--color-muted)] mt-2">Belum bisa menghitung skor bulan ini.</p>
        ) : (
          <div className="flex items-center gap-4 mt-2">
            <div className="relative w-[68px] h-[68px] shrink-0">
              <svg className="w-[68px] h-[68px] -rotate-90" viewBox="0 0 76 76">
                <circle cx="38" cy="38" r="34" stroke="var(--color-border)" strokeWidth="6" fill="none" />
                <circle
                  cx="38"
                  cy="38"
                  r="34"
                  stroke={scoreColor}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-extrabold text-[var(--foreground)]">{healthScore.score}</span>
              </div>
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: scoreColor }}>{healthScore.category}</p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">dari 100 poin</p>
            </div>
          </div>
        )}
      </div>

      {healthExpanded && healthScore && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3 max-h-48 overflow-y-auto pr-1">
          {healthScore.components.map((c, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[var(--foreground)]">{c.name}</span>
                <span className="text-[var(--color-muted)] font-semibold">{c.score}/{c.maxScore}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--background)] overflow-hidden mb-1">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                  style={{ width: `${Math.min((c.score / c.maxScore) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[var(--color-muted)] leading-tight">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PredictionCard({ prediction, mlLoading }: { prediction: Prediction | null; mlLoading: boolean }) {
  return (
    <div className={`${CARD_CLASS} p-4 sm:p-5`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">Prediksi Bulan Depan</p>
          <p className="text-[11px] text-[var(--color-muted)]">Estimasi total pengeluaran</p>
        </div>
      </div>
      {mlLoading ? (
        <div className="space-y-2 mt-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
      ) : prediction ? (
        <div>
          <p className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
            {formatRupiah(prediction.predictedNextMonth)}
          </p>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            {CONFIDENCE_LABEL[prediction.confidence] || prediction.confidence}
          </span>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)] mt-2">Belum cukup data untuk prediksi.</p>
      )}
    </div>
  );
}

function AnomaliesCard({ anomalies, mlLoading }: { anomalies: AnomalyResult[]; mlLoading: boolean }) {
  return (
    <div className={`${CARD_CLASS} p-4 sm:p-5`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M4.5 19.5h15a2.25 2.25 0 001.984-3.3l-7.5-13.5a2.25 2.25 0 00-3.968 0l-7.5 13.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">Transaksi Tidak Biasa</p>
          <p className="text-[11px] text-[var(--color-muted)]">Deteksi anomali pengeluaran</p>
        </div>
      </div>
      {mlLoading ? (
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : anomalies.length === 0 ? (
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          ✓ Tidak ada transaksi mencurigakan terdeteksi.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-28 overflow-y-auto pr-1">
          {anomalies.slice(0, 3).map((a) => (
            <div key={a.id} className="text-xs p-2 rounded-lg bg-[var(--background)] border border-[var(--color-border)]">
              <div className="flex justify-between font-semibold text-[var(--foreground)]">
                <span>{a.categoryName}</span>
                <span className="text-rose-500">{formatRupiah(a.amount)}</span>
              </div>
              {a.reason && <p className="text-[11px] text-[var(--color-muted)] mt-0.5">{a.reason}</p>}
            </div>
          ))}
          {anomalies.length > 3 && (
            <p className="text-[11px] text-center font-medium text-[var(--color-primary)]">
              +{anomalies.length - 3} transaksi lainnya
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [trend, setTrend] = useState<MonthlySummary[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [mlLoading, setMlLoading] = useState(true);

  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthExpanded, setHealthExpanded] = useState(false);

  // Menangani hydration SSR mismatch untuk Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const now = new Date();

    const fetchDashboardData = async () => {
      setChartLoading(true);
      setMlLoading(true);
      setHealthLoading(true);

      try {
        const [trendRes, breakdownRes, predictRes, anomalyRes, healthRes] = await Promise.allSettled([
          api.get("/dashboard/trend", { params: { monthsBack: 6 } }),
          api.get("/dashboard/breakdown", { params: { month: now.getMonth() + 1, year: now.getFullYear() } }),
          api.get("/ml/predict", { params: { monthsBack: 6 } }),
          api.get("/ml/anomaly"),
          api.get("/health-score"),
        ]);

        if (!isMounted) return;

        // Process Charts
        if (trendRes.status === "fulfilled") setTrend(trendRes.value.data);
        if (breakdownRes.status === "fulfilled") setBreakdown(breakdownRes.value.data);
        setChartLoading(false);

        // Process ML
        if (predictRes.status === "fulfilled") setPrediction(predictRes.value.data);
        if (anomalyRes.status === "fulfilled") {
          const rawAnomalies = anomalyRes.value.data?.anomalies || [];
          setAnomalies(rawAnomalies.filter((a: AnomalyResult) => a.isAnomaly));
        }
        setMlLoading(false);

        // Process Health Score
        if (healthRes.status === "fulfilled") setHealthScore(healthRes.value.data);
        setHealthLoading(false);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = useMemo(() => {
    return trend.map((t) => ({
      name: MONTH_SHORT[t.month - 1] || "",
      Pemasukan: t.totalIncome,
      Pengeluaran: t.totalExpense,
    }));
  }, [trend]);

  const thisMonth = trend.length > 0 ? trend[trend.length - 1] : undefined;
  const totalBreakdown = useMemo(() => breakdown.reduce((sum, b) => sum + b.total, 0), [breakdown]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="w-full px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      <PageHeader
        title={`Halo, ${user?.fullName ?? "Pengguna"}`}
        subtitle="Selamat datang kembali di dashboard keuanganmu."
      />

      {/* Grid Atas: Saldo & Health Score */}
      <div className="grid lg:grid-cols-3 gap-3.5 sm:gap-5 items-stretch">
        <BalanceCard thisMonth={thisMonth} />
        <HealthScoreCard
          healthScore={healthScore}
          healthLoading={healthLoading}
          healthExpanded={healthExpanded}
          onToggleExpand={() => setHealthExpanded((prev) => !prev)}
        />
      </div>

      {/* Grid Tengah: ML Analytics */}
      <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-5">
        <PredictionCard prediction={prediction} mlLoading={mlLoading} />
        <AnomaliesCard anomalies={anomalies} mlLoading={mlLoading} />
      </div>

      {/* Grid Bawah: Visualisasi Recharts */}
      <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Bar Chart Card */}
        <div className={`${CARD_CLASS} p-4 sm:p-5 flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Tren 6 Bulan Terakhir
            </h2>
          </div>
          {chartLoading || !mounted ? (
            <Skeleton className="w-full h-64" />
          ) : (
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="var(--color-muted)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCompact}
                  />
                  <Tooltip
                    formatter={(value) => formatRupiah(Number(value ?? 0))}
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                  <Bar dataKey="Pemasukan" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart Card */}
        <div className={`${CARD_CLASS} p-4 sm:p-5 flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Pengeluaran per Kategori (Bulan Ini)
            </h2>
          </div>
          {chartLoading || !mounted ? (
            <Skeleton className="w-full h-64" />
          ) : breakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-[var(--color-muted)]">Belum ada pengeluaran bulan ini.</p>
            </div>
          ) : (
            <>
              <div className="w-full h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="total"
                      nameKey="categoryName"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatRupiah(Number(value ?? 0))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-4 max-h-32 overflow-y-auto pr-1">
                {breakdown.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-[var(--color-border)]/40 last:border-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                      <span className="text-[var(--foreground)] font-medium">
                        {b.icon} {b.categoryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[var(--foreground)]">{formatRupiah(b.total)}</span>
                      <span className="text-[var(--color-muted)] w-8 text-right font-mono">
                        {totalBreakdown > 0 ? ((b.total / totalBreakdown) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
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