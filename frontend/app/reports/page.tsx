"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { PageHeader } from "@/components/PageHeader";

// ==========================================
// Types & Interfaces
// ==========================================
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
  totalIncome: number;
  totalExpense: number;
  previousMonthExpense: number;
  categoryBreakdown: CategoryBreakdown[];
  budgetStatus: BudgetStatus[];
}

type PeriodMode = "month" | "year" | "range";

// ==========================================
// Helpers & Constants
// ==========================================
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

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

const selectClass =
  "w-full sm:w-auto px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all cursor-pointer font-medium";

// ==========================================
// Main Component
// ==========================================
export default function ReportsPage() {
  const now = new Date();

  const [periodMode, setPeriodMode] = useState<PeriodMode>("month");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [yearOnly, setYearOnly] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(now.getMonth() + 1);
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);
  const [endYear, setEndYear] = useState(now.getFullYear());

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getDateRange = useCallback((): { startDate: string; endDate: string; label: string } => {
    if (periodMode === "month") {
      const startDate = `${year}-${pad2(month)}-01`;
      const endDate = `${year}-${pad2(month)}-${pad2(lastDayOfMonth(year, month))}`;
      return { startDate, endDate, label: `${MONTH_NAMES[month - 1]} ${year}` };
    }
    if (periodMode === "year") {
      return { startDate: `${yearOnly}-01-01`, endDate: `${yearOnly}-12-31`, label: `Tahun ${yearOnly}` };
    }
    const startDate = `${startYear}-${pad2(startMonth)}-01`;
    const endDate = `${endYear}-${pad2(endMonth)}-${pad2(lastDayOfMonth(endYear, endMonth))}`;
    return {
      startDate,
      endDate,
      label: `${MONTH_NAMES[startMonth - 1]} ${startYear} - ${MONTH_NAMES[endMonth - 1]} ${endYear}`,
    };
  }, [periodMode, month, year, yearOnly, startMonth, startYear, endMonth, endYear]);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const { startDate, endDate } = getDateRange();
      const res = await api.get("/reports", { params: { startDate, endDate } });
      setReport(res.data);
    } catch {
      setNotice({ type: "error", text: "Gagal memuat data laporan" });
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    setMonth(m);
    setYear(y);
  };

  const sendToEmail = async () => {
    setSending(true);
    setNotice(null);
    try {
      const { startDate, endDate } = getDateRange();
      const res = await api.post("/reports/send", null, { params: { startDate, endDate } });
      setNotice({ type: "success", text: res.data.message || "Laporan berhasil dikirim ke email." });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Gagal mengirim laporan";
      setNotice({ type: "error", text: message || "Gagal mengirim laporan" });
    } finally {
      setSending(false);
    }
  };

  const downloadPdf = async () => {
    setDownloadingPdf(true);
    setNotice(null);
    try {
      const { startDate, endDate, label } = getDateRange();
      const res = await api.get("/reports/pdf", { params: { startDate, endDate }, responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan - ${label}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setNotice({ type: "success", text: "PDF laporan berhasil diunduh." });
    } catch {
      setNotice({ type: "error", text: "Gagal membuat dokumen PDF" });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const expenseChange =
    report && report.previousMonthExpense > 0
      ? ((report.totalExpense - report.previousMonthExpense) / report.previousMonthExpense) * 100
      : null;

  const yearOptions = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 4 + i);

  return (
    <main className="w-full px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto space-y-6">
      {/* Header Halaman */}
      <PageHeader
        title="Laporan Keuangan"
        subtitle="Analisis kustom ringkasan keuangan, unduh PDF, atau kirim langsung ke email."
        action={
          <div className="flex items-center gap-2.5">
            <button
              onClick={downloadPdf}
              disabled={downloadingPdf || loading}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--foreground)] bg-[var(--color-surface)] hover:bg-[var(--background)] disabled:opacity-50 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--color-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H8a2 2 0 01-2-2V5a2 2 0 012-2h6l6 6v10a2 2 0 01-2 2z" />
              </svg>
              <span>{downloadingPdf ? "Membuat PDF..." : "Unduh PDF"}</span>
            </button>
            <button
              onClick={sendToEmail}
              disabled={sending || loading}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{sending ? "Mengirim..." : "Kirim Email"}</span>
            </button>
          </div>
        }
      />

      {/* Banner Informasi / Toast Notice */}
      {notice && (
        <div
          className={`flex items-center justify-between text-sm rounded-xl px-4 py-3 border transition-all ${
            notice.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-xs opacity-70 hover:opacity-100 p-1">
            ✕
          </button>
        </div>
      )}

      {/* Control Bar: Mode & Navigasi Periode */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tab Segmented Switcher */}
        <div className="inline-flex p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xs self-start">
          {(["month", "year", "range"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setPeriodMode(m)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                periodMode === m
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
              }`}
            >
              {m === "month" ? "Bulanan" : m === "year" ? "Tahunan" : "Rentang Kustom"}
            </button>
          ))}
        </div>

        {/* Date Selector Indicator */}
        {periodMode !== "range" && (
          <div className="flex items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-1.5 shadow-xs sm:w-auto">
            <button
              onClick={() => (periodMode === "month" ? changeMonth(-1) : setYearOnly((y) => y - 1))}
              className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className="font-bold text-sm text-[var(--foreground)] tracking-wide min-w-[120px] text-center">
              {periodMode === "month" ? `${MONTH_NAMES[month - 1]} ${year}` : `Tahun ${yearOnly}`}
            </p>
            <button
              onClick={() => (periodMode === "month" ? changeMonth(1) : setYearOnly((y) => y + 1))}
              className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Date Range Picker (Khusus Rentang Kustom) */}
      {periodMode === "range" && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-xs transition-all">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-muted)] mb-2 uppercase tracking-wider">
                Mulai Dari
              </label>
              <div className="flex gap-2">
                <select value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))} className={selectClass}>
                  {MONTH_NAMES.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className={selectClass}>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-muted)] mb-2 uppercase tracking-wider">
                Sampai Dengan
              </label>
              <div className="flex gap-2">
                <select value={endMonth} onChange={(e) => setEndMonth(Number(e.target.value))} className={selectClass}>
                  {MONTH_NAMES.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} className={selectClass}>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      {loading || !report ? (
        /* Skeleton Loading UI */
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5" />
            <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5" />
          </div>
        </div>
      ) : (
        <>
          {/* Card Summary Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card Pemasukan */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-emerald-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">Total Pemasukan</p>
                <p className="text-lg sm:text-xl font-bold text-[var(--foreground)] truncate mt-0.5">
                  {formatRupiah(report.totalIncome)}
                </p>
              </div>
            </div>

            {/* Card Pengeluaran */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-rose-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">Total Pengeluaran</p>
                <p className="text-lg sm:text-xl font-bold text-[var(--foreground)] truncate mt-0.5">
                  {formatRupiah(report.totalExpense)}
                </p>
              </div>
            </div>

            {/* Card Trend/Perbandingan */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-[var(--color-primary)]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">vs Periode Lalu</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <p className={`text-lg sm:text-xl font-bold ${expenseChange === null ? "text-[var(--color-muted)]" : expenseChange > 0 ? "text-rose-500" : "text-emerald-500"}`}>
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
          </div>

          {/* Detailed Cards Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Card Pengeluaran per Kategori */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                  Pengeluaran per Kategori
                </h2>
                <span className="text-xs text-[var(--color-muted)] font-medium">
                  {report.categoryBreakdown.length} Kategori
                </span>
              </div>

              {report.categoryBreakdown.length === 0 ? (
                <div className="text-center py-10 space-y-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">Tidak Ada Data</p>
                  <p className="text-xs text-[var(--color-muted)]">Belum ada catatan pengeluaran pada periode ini.</p>
                </div>
              ) : (
                <div className="space-y-3.5 pt-1">
                  {report.categoryBreakdown.map((c, i) => {
                    const percentage = report.totalExpense > 0 ? Math.min(100, Math.round((c.total / report.totalExpense) * 100)) : 0;
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-[var(--foreground)] flex items-center gap-2">
                            <span>{c.icon || "📁"}</span>
                            <span>{c.categoryName}</span>
                          </span>
                          <span className="font-semibold text-[var(--foreground)]">
                            {formatRupiah(c.total)}
                            <span className="text-xs text-[var(--color-muted)] font-normal ml-1 hover:no-underline">
                              ({percentage}%)
                            </span>
                          </span>
                        </div>
                        {/* Progress Bar Visual */}
                        <div className="w-full h-2 bg-[var(--background)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: c.color || undefined }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card Status Budget */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                  Status Anggaran / Budget
                </h2>
                <span className="text-xs text-[var(--color-muted)] font-medium">
                  {report.budgetStatus.length} Budget Aktif
                </span>
              </div>

              {report.budgetStatus.length === 0 ? (
                <div className="text-center py-10 space-y-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">Status Budget Kosong</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {periodMode === "month"
                      ? "Belum ada budget yang dikonfigurasi untuk bulan ini."
                      : "Status budget hanya tersedia saat melihat periode bulanan."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {report.budgetStatus.map((b) => {
                    const over = b.spentAmount > b.limitAmount;
                    const percent = Math.min(100, Math.round((b.spentAmount / b.limitAmount) * 100));

                    return (
                      <div key={b.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-[var(--foreground)] flex items-center gap-2">
                            <span>{b.category.icon || "🎯"}</span>
                            <span>{b.category.name}</span>
                          </span>
                          <div className="text-right">
                            <span className="font-semibold text-[var(--foreground)]">
                              {formatRupiah(b.spentAmount)}{" "}
                              <span className="text-xs text-[var(--color-muted)] font-normal">
                                / {formatRupiah(b.limitAmount)}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Status Progress Bar */}
                        <div className="w-full h-2 bg-[var(--background)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              over ? "bg-rose-500" : percent > 85 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[var(--color-muted)]">{percent}% terpakai</span>
                          <span className={`font-semibold ${over ? "text-rose-500" : "text-emerald-500"}`}>
                            {over ? "Melebihi Limit" : "Aman"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}