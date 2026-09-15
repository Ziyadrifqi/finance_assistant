"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations/auth";
import api from "@/lib/axios";
import { ThemeToggle } from "@/components/ThemeToggle";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setServerError("Link reset tidak valid. Minta link baru lewat halaman Lupa Password.");
      return;
    }
    setLoading(true);
    setServerError("");
    try {
      await api.post("/auth/reset-password", { token, newPassword: data.newPassword });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-10 sm:py-12 relative overflow-hidden">
      <div className="absolute -top-16 -left-16 w-56 h-56 sm:-top-24 sm:-left-24 sm:w-96 sm:h-96 bg-[var(--color-primary)] opacity-20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-56 h-56 sm:-bottom-24 sm:-right-24 sm:w-96 sm:h-96 bg-[var(--color-accent)] opacity-20 blur-3xl rounded-full pointer-events-none" />

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] mb-3 sm:mb-4">
            <span className="text-white font-bold text-base sm:text-lg">F</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Buat Password Baru</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1 px-4 sm:px-0">
            Masukkan password baru untuk akunmu.
          </p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl p-5 sm:p-8">
          {!token ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-500">Link reset tidak valid atau sudah kedaluwarsa.</p>
              <Link href="/forgot-password" className="text-sm text-[var(--color-accent-dark)] font-medium hover:underline mt-3 inline-block">
                Minta link baru
              </Link>
            </div>
          ) : success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[var(--color-accent-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-[var(--foreground)]">Password berhasil direset!</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">Mengalihkan ke halaman Login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Password Baru</label>
                <input
                  {...register("newPassword")}
                  type="password"
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
                {errors.newPassword && <p className="text-red-500 text-xs mt-1.5">{errors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Konfirmasi Password Baru</label>
                <input
                  {...register("confirmNewPassword")}
                  type="password"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
                {errors.confirmNewPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmNewPassword.message}</p>}
              </div>

              {serverError && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {loading ? "Menyimpan..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}