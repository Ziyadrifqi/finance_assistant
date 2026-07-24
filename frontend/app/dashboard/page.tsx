"use client";

import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-[var(--foreground)] hidden sm:inline">
              Finance AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={logout}
              className="text-sm font-medium px-3.5 py-2 rounded-lg border border-[var(--color-border)] text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
          Halo, {user?.fullName} 👋
        </h1>
        <p className="text-[var(--color-muted)] mt-1">
          Selamat datang kembali di dashboard keuanganmu.
        </p>

        <div className="mt-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 text-center">
          <p className="text-[var(--color-muted)]">
            Dashboard ini masih dasar — fitur pemasukan, pengeluaran, dan grafik
            akan kita bangun di langkah-langkah berikutnya.
          </p>
        </div>
      </main>
    </div>
  );
}