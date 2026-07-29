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
  "w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all";
const labelClass = "block text-sm font-medium text-[var(--foreground)] mb-1.5";

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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title="Budget"
        subtitle="Atur batas pengeluaran per kategori tiap bulan."
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Tambah</span>
          </button>
        }
      />

      {/* Selector bulan */}
      <div className="flex items-center justify-center gap-4 mb-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-3">
        <button
          onClick={() => changeMonth(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="font-semibold text-[var(--foreground)] w-40 text-center">
          {MONTH_NAMES[month - 1]} {year}
        </p>
        <button
          onClick={() => changeMonth(1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* List Budget */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-xl px-4 py-12 text-center">
          <p className="text-sm text-[var(--color-muted)]">
            Belum ada budget untuk {MONTH_NAMES[month - 1]} {year}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => {
            const percentage = Math.min((budget.spentAmount / budget.limitAmount) * 100, 100);
            const isOver = budget.spentAmount > budget.limitAmount;
            const isNearLimit = !isOver && percentage >= 80;

            return (
              <div key={budget.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: `${budget.category.color}18` }}
                    >
                      {budget.category.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{budget.category.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {formatRupiah(budget.spentAmount)} / {formatRupiah(budget.limitAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(budget)}
                      aria-label="Edit"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(budget.id)}
                      aria-label="Hapus"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-[var(--background)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOver ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-[var(--color-accent)]"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {isOver && (
                  <p className="text-xs text-red-500 font-medium mt-2">
                    Melebihi budget sebesar {formatRupiah(budget.spentAmount - budget.limitAmount)}
                  </p>
                )}
                {isNearLimit && (
                  <p className="text-xs text-amber-500 font-medium mt-2">
                    Sudah {percentage.toFixed(0)}% dari limit
                  </p>
                )}
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
              <p className="text-xs text-[var(--color-muted)]">
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
            {errors.categoryId && <p className="text-red-500 text-xs mt-1.5">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Limit Bulanan (Rp)</label>
            <input {...register("limitAmount")} type="number" step="0.01" placeholder="500000" className={inputClass} />
            {errors.limitAmount && <p className="text-red-500 text-xs mt-1.5">{errors.limitAmount.message}</p>}
          </div>

          {formError && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {formError}
            </div>
          )}

          <button
            type="submit"
            className="w-full text-sm font-medium py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            {editingBudget ? "Simpan Perubahan" : "Tambah Budget"}
          </button>
        </form>
      </Modal>
    </main>
  );
}