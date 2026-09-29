"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations/auth";
import api from "@/lib/axios";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  PiggyBank,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Check,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPasswordValue = watch("newPassword", "");
  const confirmNewPasswordValue = watch("confirmNewPassword", "");

  // Indikator Kekuatan Password (min: 6 karakter)
  const getPasswordStrength = () => {
    if (!newPasswordValue) return { label: "", score: 0, color: "bg-slate-700" };
    if (newPasswordValue.length < 6) return { label: "Sangat Lemah", score: 25, color: "bg-rose-500" };
    if (newPasswordValue.length < 8) return { label: "Cukup", score: 50, color: "bg-amber-500" };
    if (newPasswordValue.length < 12) return { label: "Kuat", score: 75, color: "bg-blue-500" };
    return { label: "Sangat Kuat", score: 100, color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

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
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Terjadi kesalahan, coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 md:p-12 relative font-sans transition-colors duration-300 bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden">
      
      {/* ---------------------------------------------------- */}
      {/* HEADER: Logo FinanceAI & Theme Toggle                */}
      {/* ---------------------------------------------------- */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-md mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <PiggyBank className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-wide">FinanceAI</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTAINER: Card Reset Password                   */}
      {/* ---------------------------------------------------- */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 rounded-3xl shadow-xl transition-colors duration-300 relative overflow-hidden">
          
          {/* Header Card */}
          <div className="space-y-2 mb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Buat Password Baru
            </h1>
            <p className="text-sm opacity-70 leading-relaxed">
              Buat kata sandi baru yang kuat untuk mengamankan akun Anda kembali.
            </p>
          </div>

          {/* Kondisi 1: Token Tidak Ada / Tidak Valid */}
          {!token ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-red-500">Tautan Tidak Valid</h3>
                <p className="text-xs opacity-75 leading-relaxed max-w-xs mx-auto">
                  Tautan reset password ini tidak valid atau telah kedaluwarsa.
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all text-xs"
              >
                <KeyRound className="w-4 h-4" />
                <span>Minta Tautan Baru</span>
              </Link>
            </div>
          ) : success ? (
            /* Kondisi 2: Berhasil Reset Password */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base">Password Berhasil Diperbarui!</h3>
                <p className="text-xs opacity-75 leading-relaxed max-w-xs mx-auto">
                  Kata sandi Anda telah berhasil diubah. Mengalihkan Anda ke halaman masuk...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2 text-indigo-500 text-xs font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Membuka Halaman Login</span>
              </div>
            </div>
          ) : (
            /* Kondisi 3: Form Input Reset Password */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Server Error Alert */}
              {serverError && (
                <div className="flex items-center gap-3 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Input Password Baru */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-70">
                  Password Baru
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50 group-focus-within:text-indigo-500 group-focus-within:opacity-100 transition-colors" />
                  <input
                    {...register("newPassword")}
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-12 pr-12 py-3 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity p-1"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPasswordValue && (
                  <div className="pt-1 space-y-1">
                    <div className="h-1.5 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] opacity-70 text-right">
                      Kekuatan kata sandi: <span className="font-semibold">{strength.label}</span>
                    </p>
                  </div>
                )}

                {errors.newPassword && (
                  <p className="text-red-500 text-xs font-medium pl-1 mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Input Konfirmasi Password Baru */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-70">
                  Konfirmasi Password Baru
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50 group-focus-within:text-indigo-500 group-focus-within:opacity-100 transition-colors" />
                  <input
                    {...register("confirmNewPassword")}
                    type={showConfirmNewPassword ? "text" : "password"}
                    placeholder="Ulangi password baru Anda"
                    className="w-full pl-12 pr-12 py-3 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity p-1"
                    tabIndex={-1}
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Realtime Matching Status */}
                {confirmNewPasswordValue && !errors.confirmNewPassword && (
                  <p className="text-emerald-500 text-xs font-medium flex items-center gap-1 pl-1 mt-1">
                    <Check className="w-3.5 h-3.5" /> Password cocok
                  </p>
                )}

                {errors.confirmNewPassword && (
                  <p className="text-red-500 text-xs font-medium pl-1 mt-1">
                    {errors.confirmNewPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menyimpan Password...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan Password Baru</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Kembali ke Login */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-indigo-500 font-bold hover:underline transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Kembali ke halaman Masuk</span>
            </Link>
          </div>

        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FOOTER                                               */}
      {/* ---------------------------------------------------- */}
      <div className="relative z-10 flex items-center justify-center text-xs opacity-60 max-w-md mx-auto w-full text-center">
        <span>&copy; {new Date().getFullYear()} FinanceAI published by ZripeCrop</span>
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