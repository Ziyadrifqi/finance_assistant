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
  "w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all";
const labelClass = "block text-sm font-medium text-[var(--foreground)] mb-1.5";

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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title="Target Tabungan"
        subtitle="Kumpulkan uang untuk tujuan yang kamu inginkan."
        action={
          <button
            onClick={openAddGoal}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Tambah</span>
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-xl px-4 py-12 text-center">
          <p className="text-sm text-[var(--color-muted)]">Belum ada target tabungan. Klik "Tambah" untuk membuat.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isDone = goal.currentAmount >= goal.targetAmount;

            return (
              <div key={goal.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">{goal.name}</p>
                    {goal.targetDate && (
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">
                        Target: {new Date(goal.targetDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditGoal(goal)}
                      aria-label="Edit"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      aria-label="Hapus"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-[var(--background)] overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${isDone ? "bg-[var(--color-accent)]" : "bg-[var(--color-primary)]"}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--color-muted)]">
                    {formatRupiah(goal.currentAmount)} / {formatRupiah(goal.targetAmount)}
                  </p>
                  <p className="text-xs font-medium text-[var(--foreground)]">{percentage.toFixed(0)}%</p>
                </div>

                {isDone ? (
                  <p className="text-xs text-[var(--color-accent-dark)] font-medium mt-2">🎉 Target tercapai!</p>
                ) : (
                  <button
                    onClick={() => openDeposit(goal)}
                    className="w-full mt-3 text-xs font-medium py-2 rounded-lg border border-[var(--color-border)] text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                  >
                    + Tambah Tabungan
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Tambah/Edit Target */}
      <Modal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} title={editingGoal ? "Edit Target" : "Target Baru"}>
        <form onSubmit={handleGoalSubmit(onSubmitGoal)} className="space-y-4">
          <div>
            <label className={labelClass}>Nama Target</label>
            <input {...registerGoal("name")} type="text" placeholder="Mis. Liburan ke Bali" className={inputClass} />
            {goalErrors.name && <p className="text-red-500 text-xs mt-1.5">{goalErrors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Jumlah Target (Rp)</label>
            <input {...registerGoal("targetAmount")} type="number" step="0.01" placeholder="5000000" className={inputClass} />
            {goalErrors.targetAmount && <p className="text-red-500 text-xs mt-1.5">{goalErrors.targetAmount.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Target Tanggal (opsional)</label>
            <input {...registerGoal("targetDate")} type="date" className={inputClass} />
          </div>

          <button
            type="submit"
            className="w-full text-sm font-medium py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            {editingGoal ? "Simpan Perubahan" : "Buat Target"}
          </button>
        </form>
      </Modal>

      {/* Modal: Tambah Tabungan */}
      <Modal open={depositModalOpen} onClose={() => setDepositModalOpen(false)} title={`Tambah ke "${depositTarget?.name}"`}>
        <form onSubmit={handleDepositSubmit(onSubmitDeposit)} className="space-y-4">
          <div>
            <label className={labelClass}>Jumlah (Rp)</label>
            <input {...registerDeposit("amount")} type="number" step="0.01" placeholder="100000" className={inputClass} autoFocus />
            {depositErrors.amount && <p className="text-red-500 text-xs mt-1.5">{depositErrors.amount.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full text-sm font-medium py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Tambahkan
          </button>
        </form>
      </Modal>
    </main>
  );
}