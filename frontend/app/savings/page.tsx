"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import { savingsGoalSchema, SavingsGoalFormData, depositSchema, DepositFormData } from "@/lib/validations/transaction";

interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

const inputClass =
  "w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5";

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositTarget, setDepositTarget] = useState<SavingsGoal | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/savings-goals");
      setGoals(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const {
    register: registerGoal,
    handleSubmit: handleGoalSubmit,
    reset: resetGoalForm,
    formState: { errors: goalErrors },
  } = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalSchema),
  });

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
    loadData();
  };

  const onDeleteGoal = async (id: number) => {
    if (!confirm("Hapus target tabungan ini?")) return;
    await api.delete(`/savings-goals/${id}`);
    loadData();
  };

  const {
    register: registerDeposit,
    handleSubmit: handleDepositSubmit,
    reset: resetDepositForm,
    formState: { errors: depositErrors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  const openDeposit = (goal: SavingsGoal) => {
    setDepositTarget(goal);
    resetDepositForm({ amount: "" });
    setDepositModalOpen(true);
  };

  const onSubmitDeposit = async (data: DepositFormData) => {
    if (!depositTarget) return;
    await api.post(`/savings-goals/${depositTarget.id}/deposit`, { amount: Number(data.amount) });
    setDepositModalOpen(false);
    loadData();
  };

  return (
    <div className="w-full px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      
      {/* Menggunakan PageHeader Asli (Theme Toggle Tetap Ada) */}
      <PageHeader
        title="Target Tabungan"
        subtitle="Kumpulkan uang untuk tujuan impianmu."
        action={
          <button
            onClick={openAddGoal}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-xs shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden xs:inline sm:inline">Tambah Target</span>
            <span className="inline xs:hidden sm:hidden">Tambah</span>
          </button>
        }
      />

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-7 h-7 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--color-muted)]">Memuat data tabungan...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl px-4 py-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-2.5 text-lg">
            🎯
          </div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Belum Ada Target Tabungan</p>
          <p className="text-xs text-[var(--color-muted)] mt-1 max-w-xs mx-auto">
            Mulai rencanakan impian finansialmu dengan membuat target tabungan baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {goals.map((goal) => {
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
                      <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate" title={goal.name}>
                        {goal.name}
                      </h3>
                      {goal.targetDate && (
                        <p className="text-[11px] text-[var(--color-muted)] mt-0.5 flex items-center gap-1">
                          <span>📅</span>
                          <span>
                            {new Date(goal.targetDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditGoal(goal)}
                        aria-label="Edit"
                        className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] active:bg-[var(--background)] transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002-2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        aria-label="Hapus"
                        className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-rose-500 hover:bg-rose-500/10 active:bg-rose-500/10 transition-colors"
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
                        isDone ? "bg-[var(--color-accent)]" : "bg-[var(--color-primary)]"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Nominal Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-muted)] truncate max-w-[75%]">
                      <strong className="text-[var(--foreground)] font-semibold">{formatRupiah(goal.currentAmount)}</strong>
                      <span className="mx-1 text-[var(--color-muted)]">/</span>
                      {formatRupiah(goal.targetAmount)}
                    </span>
                    <span className="font-bold text-[var(--foreground)] shrink-0">{percentage.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-1">
                  {isDone ? (
                    <div className="w-full py-2 px-3 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                      <span>🎉</span> Target Tercapai!
                    </div>
                  ) : (
                    <button
                      onClick={() => openDeposit(goal)}
                      className="w-full py-2 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--background)]/50 text-[var(--foreground)] text-xs font-semibold hover:bg-[var(--background)] active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span className="text-base leading-none">+</span> Setor Tabungan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah/Edit Target */}
      <Modal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} title={editingGoal ? "Edit Target Tabungan" : "Target Tabungan Baru"}>
        <form onSubmit={handleGoalSubmit(onSubmitGoal)} className="space-y-4">
          <div>
            <label className={labelClass}>Nama Target</label>
            <input {...registerGoal("name")} type="text" placeholder="Mis. Liburan ke Bali" className={inputClass} />
            {goalErrors.name && <p className="text-rose-500 text-xs mt-1.5">{goalErrors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Jumlah Target (Rp)</label>
            <input {...registerGoal("targetAmount")} type="number" step="0.01" placeholder="5000000" className={inputClass} />
            {goalErrors.targetAmount && <p className="text-rose-500 text-xs mt-1.5">{goalErrors.targetAmount.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Target Tanggal (opsional)</label>
            <input {...registerGoal("targetDate")} type="date" className={inputClass} />
          </div>

          <button
            type="submit"
            className="w-full text-xs sm:text-sm font-semibold py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-95 transition-all mt-2"
          >
            {editingGoal ? "Simpan Perubahan" : "Buat Target"}
          </button>
        </form>
      </Modal>

      {/* Modal Setor Tabungan */}
      <Modal open={depositModalOpen} onClose={() => setDepositModalOpen(false)} title={`Setor ke "${depositTarget?.name}"`}>
        <form onSubmit={handleDepositSubmit(onSubmitDeposit)} className="space-y-4">
          <div>
            <label className={labelClass}>Jumlah Setoran (Rp)</label>
            <input {...registerDeposit("amount")} type="number" step="0.01" placeholder="100000" className={inputClass} autoFocus />
            {depositErrors.amount && <p className="text-rose-500 text-xs mt-1.5">{depositErrors.amount.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full text-xs sm:text-sm font-semibold py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-95 transition-all mt-2"
          >
            Tambahkan Tabungan
          </button>
        </form>
      </Modal>
    </div>
  );
}