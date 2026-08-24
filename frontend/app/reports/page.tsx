"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { PageHeader } from "@/components/PageHeader";

interface CategoryBreakdown {
  categoryName: string;
  icon: string;
  color: string;
  total: number;
}

interface BudgetStatus {
  id: number;
  category: { name: string; icon: string };
  limitAmount: number;
  spentAmount: number;
}

interface Report {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  previousMonthExpense: number;
  categoryBreakdown: CategoryBreakdown[];
  budgetStatus: BudgetStatus[];
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports", { params: { month, year } });
      setReport(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    setSentMessage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const sendToEmail = async () => {
    setSending(true);
    setSentMessage("");
    try {
      const res = await api.post("/reports/send", null, { params: { month, year } });
      setSentMessage(res.data.message);
    } catch (err: any) {
      setSentMessage(err.response?.data?.message || "Gagal mengirim laporan");
    } finally {
      setSending(false);
    }
  };

  const expenseChange =
    report && report.previousMonthExpense > 0
      ? ((report.totalExpense - report.previousMonthExpense) / report.previousMonthExpense) * 100
      : null;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-up overflow-hidden">
      {/* Header Halaman */}
      <PageHeader
        title="Laporan Keuangan"
        subtitle="Ringkasan pemasukan, pengeluaran, dan budget bulananmu."
        action={
          <button
            onClick={sendToEmail}
            disabled={sending}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:shadow-lg hover:shadow-[var(--color-primary)]/20 disabled:opacity-50 transition-all active:scale-95 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline font-medium text-sm">
              {sending ? "Mengirim..." : "Kirim ke Email"}
            </span>
          </button>
        }
      />

      {sentMessage && (
        <div className="mb-5 text-xs sm:text-sm bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent-dark)] rounded-xl p-3.5 flex items-center justify-between">
          <span>{sentMessage}</span>
          <button onClick={() => setSentMessage("")} className="text-xs font-bold opacity-70 hover:opacity-100 ml-2">✕</button>
        </div>
      )}

      {/* Navigasi Bulan */}
      <div className="flex items-center justify-between mb-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-2 shadow-xs">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] transition-colors active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <p className="font-bold text-sm sm:text-base md:text-lg text-[var(--foreground)] text-center tracking-tight">
          {MONTH_NAMES[month - 1]} {year}
        </p>

        <button
          onClick={() => changeMonth(1)}
          className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] transition-colors active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading || !report ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--color-muted)]">Memuat data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Cards: 3 Kolom Responsif */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {/* Pemasukan */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">Pemasukan</span>
                <span className="p-1.5 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </span>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-accent-dark)] truncate">
                {formatRupiah(report.totalIncome)}
              </p>
            </div>

            {/* Pengeluaran */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">Pengeluaran</span>
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </span>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-rose-500 truncate">
                {formatRupiah(report.totalExpense)}
              </p>
            </div>

            {/* VS Bulan Lalu */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">vs Bulan Lalu</span>
                <span className="p-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                  expenseChange === null
                    ? "text-[var(--color-muted)]"
                    : expenseChange > 0
                    ? "text-rose-500"
                    : "text-[var(--color-accent-dark)]"
                }`}>
                  {expenseChange === null ? "-" : `${expenseChange > 0 ? "+" : ""}${expenseChange.toFixed(1)}%`}
                </p>
                {expenseChange !== null && (
                  <span className="text-xs text-[var(--color-muted)]">
                    {expenseChange > 0 ? "lebih boros" : "lebih hemat"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Grid: Pengeluaran per Kategori & Status Budget */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* Breakdown Kategori */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-6 shadow-xs min-h-[220px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm sm:text-base text-[var(--foreground)]">Pengeluaran Kategori</h2>
                <span className="text-xs text-[var(--color-muted)]">{report.categoryBreakdown.length} Kategori</span>
              </div>

              {report.categoryBreakdown.length === 0 ? (
                <div className="py-10 text-center text-xs sm:text-sm text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-xl">
                  Belum ada pengeluaran bulan ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {report.categoryBreakdown.map((c, i) => {
                    const percentage = report.totalExpense > 0 
                      ? Math.min(100, Math.round((c.total / report.totalExpense) * 100))
                      : 0;

                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">{c.icon || "📁"}</span>
                            <span className="font-medium text-[var(--foreground)] truncate">{c.categoryName}</span>
                          </div>
                          <div className="text-right shrink-0 whitespace-nowrap">
                            <span className="font-bold text-[var(--foreground)]">{formatRupiah(c.total)}</span>
                            <span className="text-[11px] text-[var(--color-muted)] ml-1">({percentage}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-[var(--background)] h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status Budget */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-6 shadow-xs min-h-[220px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm sm:text-base text-[var(--foreground)]">Status Budget</h2>
                <span className="text-xs text-[var(--color-muted)]">{report.budgetStatus.length} Item</span>
              </div>

              {report.budgetStatus.length === 0 ? (
                <div className="py-10 text-center text-xs sm:text-sm text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-xl">
                  Belum ada budget untuk bulan ini.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {report.budgetStatus.map((b) => {
                    const over = b.spentAmount > b.limitAmount;
                    const percentage = Math.min(100, Math.round((b.spentAmount / b.limitAmount) * 100));

                    return (
                      <div key={b.id} className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--color-border)]/70">
                        <div className="flex items-center justify-between text-xs sm:text-sm gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0">{b.category.icon || "🎯"}</span>
                            <span className="font-semibold text-[var(--foreground)] truncate">{b.category.name}</span>
                          </div>
                          <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                            over ? "bg-rose-500/10 text-rose-500" : "bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)]"
                          }`}>
                            {over ? "Lewat Limit" : "Aman"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-[var(--color-muted)] mb-1.5 flex-wrap gap-1">
                          <span>Terpakai: <strong className="text-[var(--foreground)]">{formatRupiah(b.spentAmount)}</strong></span>
                          <span>Batas: {formatRupiah(b.limitAmount)}</span>
                        </div>

                        <div className="w-full bg-[var(--color-surface)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]/40">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              over ? "bg-rose-500" : "bg-[var(--color-accent)]"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}