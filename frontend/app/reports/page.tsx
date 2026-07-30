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
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
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

  const expenseChange = report && report.previousMonthExpense > 0
    ? ((report.totalExpense - report.previousMonthExpense) / report.previousMonthExpense) * 100
    : null;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title="Laporan"
        subtitle="Ringkasan keuangan bulananmu, bisa dikirim ke email juga."
        action={
          <button
            onClick={sendToEmail}
            disabled={sending}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">{sending ? "Mengirim..." : "Kirim ke Email"}</span>
          </button>
        }
      />

      {sentMessage && (
        <div className="mb-4 text-sm bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent-dark)] rounded-lg px-3 py-2">
          {sentMessage}
        </div>
      )}

      {/* Selector bulan */}
      <div className="flex items-center justify-center gap-4 mb-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-3">
        <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="font-semibold text-[var(--foreground)] w-40 text-center">{MONTH_NAMES[month - 1]} {year}</p>
        <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading || !report ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Ringkasan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
              <p className="text-xs text-[var(--color-muted)]">Pemasukan</p>
              <p className="text-lg font-bold text-[var(--color-accent-dark)] mt-1">{formatRupiah(report.totalIncome)}</p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
              <p className="text-xs text-[var(--color-muted)]">Pengeluaran</p>
              <p className="text-lg font-bold text-red-500 mt-1">{formatRupiah(report.totalExpense)}</p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
              <p className="text-xs text-[var(--color-muted)]">vs Bulan Lalu</p>
              <p className={`text-lg font-bold mt-1 ${expenseChange === null ? "text-[var(--color-muted)]" : expenseChange > 0 ? "text-red-500" : "text-[var(--color-accent-dark)]"}`}>
                {expenseChange === null ? "-" : `${expenseChange > 0 ? "+" : ""}${expenseChange.toFixed(0)}%`}
              </p>
            </div>
          </div>

          {/* Breakdown Kategori */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Pengeluaran per Kategori</h2>
            {report.categoryBreakdown.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">Belum ada pengeluaran bulan ini.</p>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {report.categoryBreakdown.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-[var(--foreground)]">{c.icon} {c.categoryName}</span>
                    <span className="font-medium text-[var(--foreground)]">{formatRupiah(c.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Budget */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Status Budget</h2>
            {report.budgetStatus.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">Belum ada budget untuk bulan ini.</p>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {report.budgetStatus.map((b) => {
                  const over = b.spentAmount > b.limitAmount;
                  return (
                    <div key={b.id} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="text-[var(--foreground)]">{b.category.icon} {b.category.name}</span>
                      <div className="text-right">
                        <p className="text-[var(--foreground)]">{formatRupiah(b.spentAmount)} / {formatRupiah(b.limitAmount)}</p>
                        <p className={`text-xs ${over ? "text-red-500" : "text-[var(--color-accent-dark)]"}`}>
                          {over ? "Melebihi limit" : "Aman"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}