"use client";

import { useAuth } from "@/components/AuthProvider";
import { PageHeader } from "@/components/PageHeader";

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
      <PageHeader
        title={`Halo, ${user?.fullName}`}
        subtitle="Selamat datang kembali di dashboard keuanganmu."
      />

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 text-center">
        <p className="text-[var(--color-muted)]">
          Dashboard ini masih dasar — fitur pemasukan, pengeluaran, dan grafik
          akan kita bangun di langkah-langkah berikutnya.
        </p>
      </div>
    </main>
  );
}