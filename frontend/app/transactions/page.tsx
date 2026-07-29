"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import {
  categorySchema,
  CategoryFormData,
  transactionSchema,
  TransactionFormData,
} from "@/lib/validations/transaction";

interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
}

interface Transaction {
  id: number;
  amount: number;
  note: string | null;
  transactionDate: string;
  category: Category;
}

const PRESET_COLORS = ["#7c3aed", "#10b981", "#f97316", "#ef4444", "#3b82f6", "#eab308", "#ec4899", "#06b6d4"];
const COMMON_EMOJIS = ["🍔", "🚗", "🏠", "🛍️", "💊", "🎬", "📚", "✈️", "💰", "💼", "🎁", "📱"];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

const inputClass =
  "w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all";
const labelClass = "block text-sm font-medium text-[var(--foreground)] mb-1.5";

export default function TransactionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, txRes] = await Promise.all([api.get("/categories"), api.get("/transactions")]);
      setCategories(catRes.data);
      setTransactions(txRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    reset: resetCategoryForm,
    setValue: setCategoryValue,
    watch: watchCategory,
    formState: { errors: categoryErrors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { type: "EXPENSE", color: PRESET_COLORS[0], icon: COMMON_EMOJIS[0] },
  });

  const openCategoryModal = () => {
    resetCategoryForm({ type: "EXPENSE", color: PRESET_COLORS[0], icon: COMMON_EMOJIS[0], name: "" });
    setCategoryModalOpen(true);
  };

  const onCreateCategory = async (data: CategoryFormData) => {
    await api.post("/categories", data);
    setCategoryModalOpen(false);
    loadData();
  };

  const onDeleteCategory = async (id: number) => {
    if (!confirm("Hapus kategori ini?")) return;
    await api.delete(`/categories/${id}`);
    loadData();
  };

  const {
    register: registerTx,
    handleSubmit: handleTxSubmit,
    reset: resetTxForm,
    formState: { errors: txErrors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const openAddTransaction = () => {
    setEditingTransaction(null);
    resetTxForm({ transactionDate: new Date().toISOString().slice(0, 10), amount: "", note: "", categoryId: "" });
    setTxModalOpen(true);
  };

  const openEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    resetTxForm({
      amount: String(tx.amount),
      note: tx.note || "",
      transactionDate: tx.transactionDate,
      categoryId: String(tx.category.id),
    });
    setTxModalOpen(true);
  };

  const onSubmitTransaction = async (data: TransactionFormData) => {
    const payload = {
      amount: Number(data.amount),
      note: data.note || null,
      transactionDate: data.transactionDate,
      categoryId: Number(data.categoryId),
    };
    if (editingTransaction) {
      await api.put(`/transactions/${editingTransaction.id}`, payload);
    } else {
      await api.post("/transactions", payload);
    }
    setTxModalOpen(false);
    setEditingTransaction(null);
    loadData();
  };

  const onDeleteTransaction = async (id: number) => {
    if (!confirm("Hapus transaksi ini?")) return;
    await api.delete(`/transactions/${id}`);
    loadData();
  };

  const totalIncome = transactions.filter((t) => t.category.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.category.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title="Transaksi"
        subtitle="Catat pemasukan dan pengeluaran kamu."
        action={
          <button
            onClick={openAddTransaction}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Tambah</span>
          </button>
        }
      />

      {/* Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--color-accent-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-muted)]">Pemasukan</p>
            <p className="text-base font-bold text-[var(--foreground)] truncate">{formatRupiah(totalIncome)}</p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-muted)]">Pengeluaran</p>
            <p className="text-base font-bold text-[var(--foreground)] truncate">{formatRupiah(totalExpense)}</p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--color-primary-dark)] dark:text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-muted)]">Saldo</p>
            <p className="text-base font-bold text-[var(--foreground)] truncate">{formatRupiah(balance)}</p>
          </div>
        </div>
      </div>

      {/* Kategori */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide">Kategori</h2>
          <button
            onClick={openCategoryModal}
            className="text-xs font-medium text-[var(--color-accent-dark)] hover:underline"
          >
            + Tambah Kategori
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-xl px-4 py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--color-primary-dark)] dark:text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 11V6a3 3 0 013-3z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--color-muted)]">Belum ada kategori. Buat dulu sebelum menambah transaksi.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-medium border"
                style={{ backgroundColor: `${cat.color}14`, borderColor: `${cat.color}30`, color: cat.color }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="w-4 h-4 rounded-full flex items-center justify-center opacity-50 group-hover:opacity-100 hover:bg-black/10 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* List Transaksi */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Riwayat</h2>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[var(--color-accent-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-[var(--color-muted)]">Belum ada transaksi. Klik "Tambah" untuk mulai mencatat.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-4 gap-3 hover:bg-[var(--background)]/50 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ backgroundColor: `${tx.category.color}18` }}
                    >
                      {tx.category.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {tx.note || tx.category.name}
                      </p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">
                        {tx.category.name} · {new Date(tx.transactionDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <p className={`text-sm font-semibold ${tx.category.type === "INCOME" ? "text-[var(--color-accent-dark)]" : "text-red-500"}`}>
                      {tx.category.type === "INCOME" ? "+" : "-"}{formatRupiah(tx.amount)}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTransaction(tx)}
                        aria-label="Edit"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        aria-label="Hapus"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Tambah Kategori */}
      <Modal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="Kategori Baru">
        <form onSubmit={handleCategorySubmit(onCreateCategory)} className="space-y-4">
          <div>
            <label className={labelClass}>Nama Kategori</label>
            <input {...registerCategory("name")} type="text" placeholder="Mis. Makanan" className={inputClass} />
            {categoryErrors.name && <p className="text-red-500 text-xs mt-1.5">{categoryErrors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Tipe</label>
            <div className="grid grid-cols-2 gap-2">
              {(["EXPENSE", "INCOME"] as const).map((t) => (
                <label
                  key={t}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                    watchCategory("type") === t
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] dark:text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--background)]"
                  }`}
                >
                  <input type="radio" value={t} {...registerCategory("type")} className="hidden" />
                  {t === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setCategoryValue("icon", emoji)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-colors ${
                    watchCategory("icon") === emoji
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-border)] hover:bg-[var(--background)]"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Warna</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setCategoryValue("color", color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    watchCategory("color") === color ? "border-[var(--foreground)] scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-sm font-medium py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Simpan Kategori
          </button>
        </form>
      </Modal>

      {/* Modal: Tambah/Edit Transaksi */}
      <Modal
        open={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        title={editingTransaction ? "Edit Transaksi" : "Tambah Transaksi"}
      >
        <form onSubmit={handleTxSubmit(onSubmitTransaction)} className="space-y-4">
          <div>
            <label className={labelClass}>Jumlah (Rp)</label>
            <input {...registerTx("amount")} type="number" step="0.01" placeholder="50000" className={inputClass} />
            {txErrors.amount && <p className="text-red-500 text-xs mt-1.5">{txErrors.amount.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Kategori</label>
            {categories.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)]">
                Belum ada kategori.{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTxModalOpen(false);
                    openCategoryModal();
                  }}
                  className="text-[var(--color-accent-dark)] hover:underline"
                >
                  Buat kategori dulu
                </button>
              </p>
            ) : (
              <select {...registerTx("categoryId")} className={inputClass}>
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name} ({cat.type === "INCOME" ? "Pemasukan" : "Pengeluaran"})
                  </option>
                ))}
              </select>
            )}
            {txErrors.categoryId && <p className="text-red-500 text-xs mt-1.5">{txErrors.categoryId.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Tanggal</label>
            <input {...registerTx("transactionDate")} type="date" className={inputClass} />
            {txErrors.transactionDate && <p className="text-red-500 text-xs mt-1.5">{txErrors.transactionDate.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Catatan (opsional)</label>
            <input {...registerTx("note")} type="text" placeholder="Mis. Makan siang di kantor" className={inputClass} />
          </div>

          <button
            type="submit"
            className="w-full text-sm font-medium py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            {editingTransaction ? "Simpan Perubahan" : "Tambah Transaksi"}
          </button>
        </form>
      </Modal>
    </main>
  );
}