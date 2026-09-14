"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api, { getImageUrl } from "@/lib/axios";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
  receiptImageUrl: string | null;
}

const PRESET_COLORS = ["#7c3aed", "#10b981", "#f97316", "#ef4444", "#3b82f6", "#eab308", "#ec4899", "#06b6d4"];

const EMOJI_CATEGORIES = [
  { name: "Makanan & Minuman", emojis: ["🍔", "🍕", "🧋", "☕", "🍜", "🍞", "🍱", "🍦"] },
  { name: "Transportasi & Kendaraan", emojis: ["🚗", "🛵", "🚌", "⛽", "✈️", "🚕", "🚆", "🅿️"] },
  { name: "Kebutuhan & Belanja", emojis: ["🛒", "🛍️", "🏠", "💡", "⚡", "💧", "📱", "💊"] },
  { name: "Hiburan & Gaya Hidup", emojis: ["🎬", "🎮", "📚", "🏋️", "🎧", "🎟️", "🎨", "🐾"] },
  { name: "Keuangan & Kerja", emojis: ["💰", "💵", "💳", "💼", "📈", "🎁", "🏥", "🎓"] },
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

const inputClass =
  "w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function TransactionsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<{
    type: "category" | "transaction";
    id: number;
    label: string;
  } | null>(null);

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // State untuk unggah & scan struk
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState("");
  const [ocrNotice, setOcrNotice] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, txRes] = await Promise.all([
        api.get("/categories"),
        api.get("/transactions", { params: { month, year } }),
      ]);
      setCategories(catRes.data);
      setTransactions(txRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    reset: resetCategoryForm,
    setValue: setCategoryValue,
    watch: watchCategory,
    formState: { errors: categoryErrors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { type: "EXPENSE", color: PRESET_COLORS[0], icon: EMOJI_CATEGORIES[0].emojis[0] },
  });

  const openCategoryModal = () => {
    resetCategoryForm({ type: "EXPENSE", color: PRESET_COLORS[0], icon: EMOJI_CATEGORIES[0].emojis[0], name: "" });
    setCategoryModalOpen(true);
  };

  const onCreateCategory = async (data: CategoryFormData) => {
    await api.post("/categories", data);
    setCategoryModalOpen(false);
    loadData();
  };

  const requestDeleteCategory = (cat: Category) => {
    setConfirmTarget({ type: "category", id: cat.id, label: cat.name });
  };

  const {
    register: registerTx,
    handleSubmit: handleTxSubmit,
    reset: resetTxForm,
    setValue: setTxValue,
    watch: watchTx,
    formState: { errors: txErrors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const resetReceiptState = () => {
    setReceiptImageUrl(null);
    setOcrError("");
    setOcrNotice("");
    if (receiptInputRef.current) receiptInputRef.current.value = "";
  };

  const closeTxModal = () => {
    setTxModalOpen(false);
    setCategoryDropdownOpen(false);
    setCategorySearch("");
    resetReceiptState();
  };

  const openAddTransaction = () => {
    setEditingTransaction(null);
    resetTxForm({ transactionDate: new Date().toISOString().slice(0, 10), amount: "", note: "", categoryId: "" });
    setCategorySearch("");
    resetReceiptState();
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
    setCategorySearch("");
    setOcrError("");
    setOcrNotice("");
    setReceiptImageUrl(tx.receiptImageUrl || null);
    setTxModalOpen(true);
  };

  const onReceiptSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrError("");
    setOcrNotice("");
    setOcrLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/receipts/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setReceiptImageUrl(res.data.receiptImageUrl);

      let filled = false;
      if (res.data.detectedAmount) {
        setTxValue("amount", String(res.data.detectedAmount), { shouldValidate: true });
        filled = true;
      }
      if (res.data.detectedDate) {
        const parsed = parseDetectedDate(res.data.detectedDate);
        if (parsed) {
          setTxValue("transactionDate", parsed, { shouldValidate: true });
          filled = true;
        }
      }

      setOcrNotice(
        filled
          ? "Struk berhasil dibaca. Cek dan sesuaikan jumlah/tanggal sebelum menyimpan."
          : "Struk terunggah, tapi jumlah/tanggal tidak terbaca otomatis. Isi manual ya."
      );
    } catch (err: any) {
      setOcrError(err.response?.data?.message || "Gagal memindai struk");
    } finally {
      setOcrLoading(false);
    }
  };

  const parseDetectedDate = (raw: string): string | null => {
    // Coba beberapa format umum di struk Indonesia: dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd
    const slashMatch = raw.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
    if (slashMatch) {
      let [, d, m, y] = slashMatch;
      if (y.length === 2) y = "20" + y;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
    }
    const isoMatch = raw.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
    }
    return null;
  };

  const removeReceipt = () => {
    resetReceiptState();
  };

  const onSubmitTransaction = async (data: TransactionFormData) => {
    const payload = {
      amount: Number(data.amount),
      note: data.note || null,
      transactionDate: data.transactionDate,
      categoryId: Number(data.categoryId),
      receiptImageUrl: receiptImageUrl,
    };
    if (editingTransaction) {
      await api.put(`/transactions/${editingTransaction.id}`, payload);
    } else {
      await api.post("/transactions", payload);
    }
    closeTxModal();
    setEditingTransaction(null);
    loadData();
  };

  const requestDeleteTransaction = (tx: Transaction) => {
    setConfirmTarget({ type: "transaction", id: tx.id, label: tx.note || tx.category.name });
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    if (confirmTarget.type === "category") {
      await api.delete(`/categories/${confirmTarget.id}`);
    } else {
      await api.delete(`/transactions/${confirmTarget.id}`);
    }
    setConfirmTarget(null);
    loadData();
  };

  const totalIncome = transactions.filter((t) => t.category.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.category.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const selectedCategoryId = watchTx("categoryId");
  const selectedCategory = categories.find((c) => String(c.id) === selectedCategoryId);
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const receiptPreviewUrl = getImageUrl(receiptImageUrl);

  return (
    <div className="w-full px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      <PageHeader
        title="Transaksi"
        subtitle="Catat pemasukan dan pengeluaran kamu."
        action={
          <button
            onClick={openAddTransaction}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-xs shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden xs:inline sm:inline">Tambah Transaksi</span>
            <span className="inline xs:hidden sm:hidden">Tambah</span>
          </button>
        }
      />

      <div className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3 shadow-xs">
        <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-xl text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors" aria-label="Bulan sebelumnya">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="font-bold text-sm sm:text-base text-[var(--foreground)]">{MONTH_NAMES[month - 1]} {year}</p>
        <button onClick={() => changeMonth(1)} className="p-1.5 rounded-xl text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors" aria-label="Bulan berikutnya">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-muted)] font-medium">Pemasukan</p>
            <p className="text-base sm:text-lg font-bold text-[var(--foreground)] truncate">{formatRupiah(totalIncome)}</p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-muted)] font-medium">Pengeluaran</p>
            <p className="text-base sm:text-lg font-bold text-[var(--foreground)] truncate">{formatRupiah(totalExpense)}</p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-muted)] font-medium">Sisa Saldo</p>
            <p className="text-base sm:text-lg font-bold text-[var(--foreground)] truncate">{formatRupiah(balance)}</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Kategori</h2>
          <button onClick={openCategoryModal} className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
            <span>+</span> Tambah Kategori
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="text-xs text-[var(--color-muted)] text-center py-3">Belum ada kategori. Klik "+ Tambah Kategori" untuk membuat.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="group flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-xl text-xs font-semibold border transition-all" style={{ backgroundColor: `${cat.color}14`, borderColor: `${cat.color}30`, color: cat.color }}>
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <button onClick={() => requestDeleteCategory(cat)} aria-label="Hapus kategori" className="w-4 h-4 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-100 hover:bg-black/10 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Riwayat Transaksi</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-7 h-7 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[var(--color-muted)]">Memuat riwayat transaksi...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="border border-dashed border-[var(--color-border)] rounded-2xl px-4 py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-2.5 text-lg">💸</div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Belum Ada Transaksi</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">Catat pemasukan atau pengeluaranmu bulan ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base" style={{ backgroundColor: `${tx.category.color}18` }}>
                    {tx.category.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate flex items-center gap-1.5">
                      {tx.note || tx.category.name}
                      {tx.receiptImageUrl && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-[var(--color-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 4h16v16H4V4z" />
                        </svg>
                      )}
                    </p>
                    <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
                      {tx.category.name} · {new Date(tx.transactionDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <p className={`text-xs sm:text-sm font-bold ${tx.category.type === "INCOME" ? "text-[var(--color-accent-dark)]" : "text-rose-500"}`}>
                    {tx.category.type === "INCOME" ? "+" : "-"}{formatRupiah(tx.amount)}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditTransaction(tx)} aria-label="Edit" className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002-2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => requestDeleteTransaction(tx)} aria-label="Hapus" className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
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

      {/* Modal: Tambah/Edit Kategori */}
      <Modal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="Kategori Baru">
        <form onSubmit={handleCategorySubmit(onCreateCategory)} className="space-y-4">
          <div>
            <label className={labelClass}>Nama Kategori</label>
            <input {...registerCategory("name")} type="text" placeholder="Mis. Makanan" className={inputClass} />
            {categoryErrors.name && <p className="text-rose-500 text-xs mt-1.5">{categoryErrors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Tipe</label>
            <div className="grid grid-cols-2 gap-2">
              {(["EXPENSE", "INCOME"] as const).map((t) => (
                <label key={t} className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${watchCategory("type") === t ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--background)]"}`}>
                  <input type="radio" value={t} {...registerCategory("type")} className="hidden" />
                  {t === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass}>Icon Emoji</label>
              <span className="text-[10px] text-[var(--color-muted)]">Pilih atau ketik</span>
            </div>
            <div className="space-y-2.5 max-h-44 overflow-y-auto p-2 border border-[var(--color-border)] rounded-xl bg-[var(--background)]">
              {EMOJI_CATEGORIES.map((catGroup) => (
                <div key={catGroup.name}>
                  <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-1">{catGroup.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {catGroup.emojis.map((emoji) => (
                      <button type="button" key={emoji} onClick={() => setCategoryValue("icon", emoji)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border transition-all ${watchCategory("icon") === emoji ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-105" : "border-transparent hover:bg-[var(--color-surface)]"}`}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input type="text" maxLength={4} placeholder="Ketik emoji sendiri..." {...registerCategory("icon")} className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-sm flex items-center justify-center shrink-0 border border-[var(--color-border)] font-bold">
                {watchCategory("icon") || "❓"}
              </div>
            </div>
            {categoryErrors.icon && <p className="text-rose-500 text-xs mt-1.5">{categoryErrors.icon.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Warna Kategori</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button type="button" key={color} onClick={() => setCategoryValue("color", color)} className={`w-7 h-7 rounded-full border-2 transition-all ${watchCategory("color") === color ? "border-[var(--foreground)] scale-110" : "border-transparent"}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>

          <button type="submit" className="w-full text-xs sm:text-sm font-semibold py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-95 transition-all mt-2">
            Simpan Kategori
          </button>
        </form>
      </Modal>

      {/* Modal: Tambah/Edit Transaksi */}
      <Modal open={txModalOpen} onClose={closeTxModal} title={editingTransaction ? "Edit Transaksi" : "Tambah Transaksi"}>
        <form onSubmit={handleTxSubmit(onSubmitTransaction)} className="space-y-4">
          {/* Unggah Struk */}
          <div>
            <label className={labelClass}>Struk (opsional)</label>
            <input ref={receiptInputRef} type="file" accept="image/*" onChange={onReceiptSelected} className="hidden" />

            {!receiptPreviewUrl ? (
              <button
                type="button"
                onClick={() => receiptInputRef.current?.click()}
                disabled={ocrLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-dashed border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
              >
                {ocrLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    Membaca struk...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Unggah foto struk (jumlah & tanggal terisi otomatis)
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--background)]">
                <img src={receiptPreviewUrl} alt="Struk" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--foreground)] font-medium">Struk terunggah</p>
                  <button type="button" onClick={() => receiptInputRef.current?.click()} className="text-[11px] text-[var(--color-accent-dark)] hover:underline">
                    Ganti foto
                  </button>
                </div>
                <button type="button" onClick={removeReceipt} aria-label="Hapus struk" className="text-[var(--color-muted)] hover:text-rose-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {ocrNotice && <p className="text-[11px] text-[var(--color-accent-dark)] mt-1.5">{ocrNotice}</p>}
            {ocrError && <p className="text-rose-500 text-xs mt-1.5">{ocrError}</p>}
          </div>

          <div>
            <label className={labelClass}>Jumlah (Rp)</label>
            <input {...registerTx("amount")} type="number" step="0.01" placeholder="50000" className={inputClass} />
            {txErrors.amount && <p className="text-rose-500 text-xs mt-1.5">{txErrors.amount.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Kategori</label>
            {categories.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)]">
                Belum ada kategori.{" "}
                <button type="button" onClick={() => { closeTxModal(); openCategoryModal(); }} className="text-[var(--color-primary)] font-semibold hover:underline">
                  Buat kategori dulu
                </button>
              </p>
            ) : (
              <div className="relative">
                <input type="hidden" {...registerTx("categoryId")} />
                <button type="button" onClick={() => setCategoryDropdownOpen((o) => !o)} className={`${inputClass} text-left flex items-center justify-between`}>
                  {selectedCategory ? (
                    <span className="truncate">
                      {selectedCategory.icon} {selectedCategory.name}{" "}
                      <span className="text-[var(--color-muted)]">({selectedCategory.type === "INCOME" ? "Pemasukan" : "Pengeluaran"})</span>
                    </span>
                  ) : (
                    <span className="text-[var(--color-muted)]">Pilih kategori</span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-[var(--color-muted)] flex-shrink-0 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute z-20 mt-1.5 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden">
                    <input autoFocus type="text" value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} placeholder="Cari kategori..." className="w-full px-3 py-2.5 text-sm border-b border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none" />
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCategories.length === 0 ? (
                        <p className="px-3 py-4 text-xs text-[var(--color-muted)] text-center">Kategori tidak ditemukan</p>
                      ) : (
                        filteredCategories.map((cat) => (
                          <button type="button" key={cat.id} onClick={() => { setTxValue("categoryId", String(cat.id), { shouldValidate: true }); setCategoryDropdownOpen(false); setCategorySearch(""); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-[var(--background)] transition-colors">
                            <span>{cat.icon}</span>
                            <span className="text-[var(--foreground)] truncate">{cat.name}</span>
                            <span className="ml-auto text-[10px] text-[var(--color-muted)] flex-shrink-0">{cat.type === "INCOME" ? "Masuk" : "Keluar"}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {txErrors.categoryId && <p className="text-rose-500 text-xs mt-1.5">{txErrors.categoryId.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Tanggal</label>
            <input {...registerTx("transactionDate")} type="date" className={inputClass} />
            {txErrors.transactionDate && <p className="text-rose-500 text-xs mt-1.5">{txErrors.transactionDate.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Catatan (opsional)</label>
            <input {...registerTx("note")} type="text" placeholder="Mis. Makan siang di kantor" className={inputClass} />
          </div>

          <button type="submit" className="w-full text-xs sm:text-sm font-semibold py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-95 transition-all mt-2">
            {editingTransaction ? "Simpan Perubahan" : "Tambah Transaksi"}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.type === "category" ? "Hapus Kategori" : "Hapus Transaksi"}
        message={`Yakin ingin menghapus "${confirmTarget?.label}"? Tindakan ini tidak bisa dibatalkan.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}