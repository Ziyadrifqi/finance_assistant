"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Target,
  CheckCircle2,
  Loader2,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";

import api from "@/lib/axios";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import { SourceBadge } from "@/components/SourceBadge";
import { PaymentSource, SourceAmount, SOURCE_TYPE_ICON } from "@/lib/sources";
import {
  savingsGoalSchema,
  SavingsGoalFormData,
  depositSchema,
  DepositFormData,
} from "@/lib/validations/transaction";

interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  sourceBreakdown: SourceAmount[];
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const inputClass =
  "w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5";

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [sources, setSources] = useState<PaymentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositTarget, setDepositTarget] = useState<SavingsGoal | null>(null);
  const [depositSourceId, setDepositSourceId] = useState<number | null>(null);
  const [depositSourceError, setDepositSourceError] = useState("");

  // State Modal Hapus
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null);

  // Fetch Goals + Sumber Dana
  const loadData = useCallback(async () => {
    try {
      const [goalRes, sourceRes] = await Promise.all([
        api.get("/savings-goals"),
        api.get("/payment-sources"),
      ]);
      setGoals(goalRes.data);
      setSources(sourceRes.data);
    } catch (error) {
      console.error("Gagal memuat data tabungan:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter Data Berdasarkan Search Query
  const filteredGoals = goals.filter((goal) =>
    goal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Form Hooks
  const {
    register: registerGoal,
    handleSubmit: handleGoalSubmit,
    reset: resetGoalForm,
    formState: { errors: goalErrors },
  } = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalSchema),
  });

  const {
    register: registerDeposit,
    handleSubmit: handleDepositSubmit,
    reset: resetDepositForm,
    formState: { errors: depositErrors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  // Handlers - Goal
  const openAddGoal = () => {
    setEditingGoal(null);
    resetGoalForm({ name: "", targetAmount: "", targetDate: "" });
    setGoalModalOpen(true);
  };

  const openEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    resetGoalForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      targetDate: goal.targetDate || "",
    });
    setGoalModalOpen(true);
  };

  const onSubmitGoal = async (data: SavingsGoalFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        targetAmount: Number(data.targetAmount),
        targetDate: data.targetDate || null,
      };

      if (editingGoal) {
        await api.put(`/savings-goals/${editingGoal.id}`, payload);
      } else {
        await api.post("/savings-goals", payload);
      }

      setGoalModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Gagal menyimpan target tabungan:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers - Delete
  const openDeleteModal = (goal: SavingsGoal) => {
    setDeletingGoal(goal);
    setDeleteModalOpen(true);
  };

  const ConfirmDeleteGoal = async () => {
    if (!deletingGoal) return;
    setSubmitting(true);
    try {
      await api.delete(`/savings-goals/${deletingGoal.id}`);
      setDeleteModalOpen(false);
      setDeletingGoal(null);
      await loadData();
    } catch (error) {
      console.error("Gagal menghapus target tabungan:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers - Deposit
  const openDeposit = (goal: SavingsGoal) => {
    setDepositTarget(goal);
    setDepositSourceId(null);
    setDepositSourceError("");
    resetDepositForm({ amount: "" });
    setDepositModalOpen(true);
  };

  const onSubmitDeposit = async (data: DepositFormData) => {
    if (!depositTarget) return;
    if (!depositSourceId) {
      setDepositSourceError("Pilih sumber dana setoran");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/savings-goals/${depositTarget.id}/deposit`, {
        amount: Number(data.amount),
        paymentSourceId: depositSourceId,
      });
      setDepositModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Gagal melakukan setoran:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <PageHeader
        title="Target Tabungan"
        subtitle="Kumpulkan uang untuk tujuan impianmu."
        action={
          <button
            onClick={openAddGoal}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Tambah Target</span>
            <span className="inline xs:hidden sm:hidden">Tambah</span>
          </button>
        }
      />

      {/* Control Bar: Search Input */}
      {!loading && goals.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Cari target tabungan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--foreground)] p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 text-[var(--color-primary)] animate-spin" />
          <p className="text-xs text-[var(--color-muted)]">Memuat data tabungan...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl px-4 py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Belum Ada Target Tabungan
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1 max-w-xs mx-auto">
            Mulai rencanakan impian finansialmu dengan membuat target tabungan baru.
          </p>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl px-4 py-10 text-center space-y-2">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Target tidak ditemukan
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            Tidak ada target tabungan yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-[var(--color-primary)] font-semibold hover:underline pt-1 inline-block"
          >
            Bersihkan Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {filteredGoals.map((goal) => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isDone = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-3"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate"
                        title={goal.name}
                      >
                        {goal.name}
                      </h3>
                      {goal.targetDate && (
                        <p className="text-[11px] text-[var(--color-muted)] mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(goal.targetDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditGoal(goal)}
                        aria-label="Edit"
                        className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(goal)}
                        aria-label="Hapus"
                        className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[var(--background)] h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone ? "bg-[var(--color-accent)]" : "bg-[var(--color-primary)]"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Nominal Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-muted)] truncate max-w-[75%]">
                      <strong className="text-[var(--foreground)] font-semibold">
                        {formatRupiah(goal.currentAmount)}
                      </strong>
                      <span className="mx-1 text-[var(--color-muted)]">/</span>
                      {formatRupiah(goal.targetAmount)}
                    </span>
                    <span className="font-bold text-[var(--foreground)] shrink-0">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  {/* Rincian tabungan per sumber dana */}
                  {goal.sourceBreakdown?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
                        Terkumpul dari
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {goal.sourceBreakdown.map((s) => (
                          <SourceBadge
                            key={s.id ?? "none"}
                            name={s.name}
                            type={s.type}
                            color={s.color}
                            extra={formatRupiah(s.total)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="pt-1">
                  {isDone ? (
                    <div className="w-full py-2 px-3 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                      <span>Target Tercapai!</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => openDeposit(goal)}
                      className="w-full py-2 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--background)]/50 text-[var(--foreground)] text-xs font-semibold hover:bg-[var(--background)] active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Setor Tabungan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah/Edit Target */}
      <Modal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title={editingGoal ? "Edit Target Tabungan" : "Target Tabungan Baru"}
      >
        <form onSubmit={handleGoalSubmit(onSubmitGoal)} className="space-y-4">
          <div>
            <label className={labelClass}>Nama Target</label>
            <input
              {...registerGoal("name")}
              type="text"
              placeholder="Mis. Liburan ke Bali"
              className={inputClass}
            />
            {goalErrors.name && (
              <p className="text-rose-500 text-xs mt-1.5">{goalErrors.name.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Jumlah Target (Rp)</label>
            <input
              {...registerGoal("targetAmount")}
              type="number"
              step="0.01"
              placeholder="5000000"
              className={inputClass}
            />
            {goalErrors.targetAmount && (
              <p className="text-rose-500 text-xs mt-1.5">{goalErrors.targetAmount.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Target Tanggal (opsional)</label>
            <input {...registerGoal("targetDate")} type="date" className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-xs sm:text-sm font-semibold py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingGoal ? "Simpan Perubahan" : "Buat Target"}
          </button>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus Target */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Hapus Target Tabungan"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 text-rose-500">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed">
              Apakah Anda yakin ingin menghapus target{" "}
              <strong className="font-bold underline">{deletingGoal?.name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs sm:text-sm font-semibold hover:bg-[var(--background)] transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={ConfirmDeleteGoal}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs sm:text-sm font-semibold hover:bg-rose-700 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Setor Tabungan */}
      <Modal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        title={`Setor ke "${depositTarget?.name}"`}
      >
        <form onSubmit={handleDepositSubmit(onSubmitDeposit)} className="space-y-4">
          <div>
            <label className={labelClass}>Jumlah Setoran (Rp)</label>
            <input
              {...registerDeposit("amount")}
              type="number"
              step="0.01"
              placeholder="100000"
              className={inputClass}
              autoFocus
            />
            {depositErrors.amount && (
              <p className="text-rose-500 text-xs mt-1.5">{depositErrors.amount.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Sumber Dana</label>
            {sources.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)] bg-[var(--background)] p-3 rounded-xl border border-[var(--color-border)]">
                Belum ada sumber dana. Tambahkan bank atau e-wallet dulu di halaman Transaksi (bagian &quot;Sumber Dana&quot;).
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {sources.map((s) => {
                  const selected = depositSourceId === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => {
                        setDepositSourceId(s.id);
                        setDepositSourceError("");
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                        selected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : "border-[var(--color-border)] text-[var(--foreground)] hover:bg-[var(--background)]"
                      }`}
                    >
                      <span>{SOURCE_TYPE_ICON[s.type]}</span>
                      <span className="truncate">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {depositSourceError && (
              <p className="text-rose-500 text-xs mt-1.5">{depositSourceError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || sources.length === 0}
            className="w-full text-xs sm:text-sm font-semibold py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Tambahkan Tabungan
          </button>
        </form>
      </Modal>
    </div>
  );
}