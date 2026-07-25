"use client";

import { useAuth } from "@/components/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
          Halo, {user?.fullName}
        </h1>
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
      </div>
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
  );
}