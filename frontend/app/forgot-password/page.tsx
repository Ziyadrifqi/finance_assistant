"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations/auth";
import api from "@/lib/axios";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ForgotPasswordPage() {
  const [serverMessage, setServerMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setServerMessage("");
    try {
      const res = await api.post("/auth/forgot-password", data);
      setServerMessage(res.data.message);
      setSubmitted(true);
    } catch (err: any) {
      setServerMessage(err.response?.data?.message || "Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-10 sm:py-12 relative overflow-hidden">
      <div className="absolute -top-16 -left-16 w-56 h-56 sm:-top-24 sm:-left-24 sm:w-96 sm:h-96 bg-[var(--color-accent)] opacity-20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-56 h-56 sm:-bottom-24 sm:-right-24 sm:w-96 sm:h-96 bg-[var(--color-primary)] opacity-20 blur-3xl rounded-full pointer-events-none" />

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] mb-3 sm:mb-4">
            <span className="text-white font-bold text-base sm:text-lg">F</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Lupa Password</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1 px-4 sm:px-0">
            Masukkan email akunmu, kami kirim link reset password.
          </p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl p-5 sm:p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[var(--color-accent-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-[var(--foreground)]">{serverMessage}</p>
              <p className="text-xs text-[var(--color-muted)] mt-2">Cek juga folder Spam kalau belum masuk.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Masukkan Email Anda"
                  autoCapitalize="none"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              {serverMessage && !submitted && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                  {serverMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[var(--color-muted)] mt-6">
          Ingat password?{" "}
          <Link href="/login" className="text-[var(--color-accent-dark)] font-medium hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}