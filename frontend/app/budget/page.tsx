"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import { budgetSchema, BudgetFormData } from "@/lib/validations/transaction";

interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
}

interface Budget {
  id: number;
  category: Category;
  limitAmount: number;
  spentAmount: number;
  month: number;
  year: number;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

const inputClass =
  "w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5";

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, budgetRes] = await Promise.all([
        api.get("/categories"),
        api.get("/budgets", { params: { month, year } }),
      ]);
      setCategories(catRes.data.filter((c: Category) => c.type === "EXPENSE"));
      setBudgets(budgetRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
  });

  const availableCategories = categories.filter(
    (c) => editingBudget?.category.id === c.id || !budgets.some((b) => b.category.id === c.id)
  );

  const openAdd = () => {
    setEditingBudget(null);
    setFormError("");
    reset({ categoryId: "", limitAmount: "" });
    setModalOpen(true);
  };

  const openEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormError("");
    reset({ categoryId: String(budget.category.id), limitAmount: String(budget.limitAmount) });
    setModalOpen(true);
  };

  const onSubmit = async (data: BudgetFormData) => {
    setFormError("");
    const payload = {
      categoryId: Number(data.categoryId),
      limitAmount: Number(data.limitAmount),
      month,
      year,
    };
    try {
      if (editingBudget) {
        await api.put(`/budgets/${editingBudget.id}`, payload);
      } else {
        await api.post("/budgets", payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Terjadi kesalahan, coba lagi");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Hapus budget ini?")) return;
    await api.delete(`/budgets/${id}`);
    loadData();
  };

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

  return (
    <div className="w-full px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      
      {/* Menggunakan PageHeader Asli (Theme Toggle Tetap Ada) */}
      <PageHeader
        title="Budget"
        subtitle="Atur batas pengeluaran per kategori tiap bulan."
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-xs shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden xs:inline sm:inline">Tambah Budget</span>
            <span className="inline xs:hidden sm:hidden">Tambah</span>
          </button>
        }
      />

      {/* Navigasi Bulan Disetarakan */}
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

      {/* List Budget */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--color-muted)]">Memuat data budget...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl px-4 py-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-2.5 text-lg">
            📊
          </div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Belum Ada Budget</p>
          <p className="text-xs text-[var(--color-muted)] mt-1 max-w-xs mx-auto">
            Belum ada budget untuk {MONTH_NAMES[month - 1]} {year}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3.5 sm:gap-4">
          {budgets.map((budget) => {
            const percentage = Math.min((budget.spentAmount / budget.limitAmount) * 100, 100);
            const isOver = budget.spentAmount > budget.limitAmount;
            const isNearLimit = !isOver && percentage >= 80;

            return (
              <div 
                key={budget.id} 
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 shadow-2xs"
                        style={{ backgroundColor: `${budget.category.color}18` }}
                      >
                        {budget.category.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                          {budget.category.name}
                        </p>
                        <p className="text-[11px] sm:text-xs text-[var(--color-muted)] truncate mt-0.5">
                          <strong className="text-[var(--foreground)] font-semibold">{formatRupiah(budget.spentAmount)}</strong>
                          <span className="mx-1">/</span>
                          {formatRupiah(budget.limitAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(budget)}
                        aria-label="Edit"
                        className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002-2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(budget.id)}
                        aria-label="Hapus"
                        className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[var(--background)] h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? "bg-rose-500" : isNearLimit ? "bg-amber-500" : "bg-[var(--color-accent)]"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Info Text */}
                <div className="pt-1">
                  {isOver && (
                    <p className="text-[11px] sm:text-xs text-rose-500 font-semibold flex items-center gap-1">
                      <span>⚠️</span> Melebihi budget {formatRupiah(budget.spentAmount - budget.limitAmount)}
                    </p>
                  )}
                  {isNearLimit && (
                    <p className="text-[11px] sm:text-xs text-amber-500 font-semibold flex items-center gap-1">
                      <span>⚡</span> Terpakai {percentage.toFixed(0)}% dari limit
                    </p>
                  )}
                  {!isOver && !isNearLimit && (
                    <p className="text-[11px] text-[var(--color-muted)]">
                      Sisa budget: {formatRupiah(budget.limitAmount - budget.spentAmount)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingBudget ? "Edit Budget" : "Tambah Budget"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Kategori</label>
            {availableCategories.length === 0 && !editingBudget ? (
              <p className="text-xs text-[var(--color-muted)] bg-[var(--background)] p-3 rounded-xl border border-[var(--color-border)]">
                Semua kategori pengeluaran sudah punya budget bulan ini, atau kamu belum punya kategori pengeluaran.
              </p>
            ) : (
              <select {...register("categoryId")} className={inputClass}>
                <option value="">Pilih kategori</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            )}
            {errors.categoryId && <p className="text-rose-500 text-xs mt-1.5">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Limit Bulanan (Rp)</label>
            <input {...register("limitAmount")} type="number" step="0.01" placeholder="500000" className={inputClass} />
            {errors.limitAmount && <p className="text-rose-500 text-xs mt-1.5">{errors.limitAmount.message}</p>}
          </div>

          {formError && (
            <div className="text-rose-600 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl px-3.5 py-2.5">
              {formError}
            </div>
          )}

          <button
            type="submit"
            className="w-full text-xs sm:text-sm font-semibold py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-95 transition-all mt-2"
          >
            {editingBudget ? "Simpan Perubahan" : "Tambah Budget"}
          </button>
        </form>
      </Modal>
    </div>
  );
}