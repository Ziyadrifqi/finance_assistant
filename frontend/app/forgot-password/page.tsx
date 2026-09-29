"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations/auth";
import api from "@/lib/axios";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  PiggyBank, 
  Mail, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Send 
} from "lucide-react";

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
      setServerMessage(res.data.message || "Instruksi reset password telah dikirim ke email Anda.");
      setSubmitted(true);
    } catch (err: any) {
      setServerMessage(err.response?.data?.message || "Terjadi kesalahan, coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 md:p-12 relative font-sans transition-colors duration-300 bg-[var(--color-bg)] text-[var(--color-text)]">
      
      {/* ---------------------------------------------------- */}
      {/* HEADER: Logo FinanceAI & Theme Toggle                */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
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
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 rounded-3xl shadow-xl transition-colors duration-300 relative overflow-hidden">
          
          {/* Header Card */}
          <div className="space-y-2 mb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Lupa Password?
            </h1>
            <p className="text-sm opacity-70 leading-relaxed">
              Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
            </p>
          </div>

          {/* Kondisi Jika Email Sudah Berhasil Terkirim */}
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-bold text-base">Periksa Email Anda</h3>
                <p className="text-xs opacity-75 leading-relaxed max-w-xs mx-auto">
                  {serverMessage}
                </p>
              </div>

              <div className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs opacity-60 text-left space-y-1">
                <p className="font-medium">💡 Catatan:</p>
                <p>Jika email tidak ditemukan di Kotak Masuk, silakan periksa folder <strong>Spam</strong> atau <strong>Promosi</strong>.</p>
              </div>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs text-indigo-500 font-semibold hover:underline cursor-pointer pt-2 inline-block"
              >
                Kirim ulang email reset
              </button>
            </div>
          ) : (
            /* Form Input Email */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Server Error Alert */}
              {serverMessage && !submitted && (
                <div className="flex items-center gap-3 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{serverMessage}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-70">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50 group-focus-within:text-indigo-500 group-focus-within:opacity-100 transition-colors" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="Masukkan Email Anda"
                    autoCapitalize="none"
                    className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs font-medium pl-1 mt-1">
                    {errors.email.message}
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
                    <span>Mengirim Tautan...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Link Reset</span>
                    <Send className="w-4 h-4" />
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
      <div className="flex items-center justify-center text-xs opacity-60 max-w-md mx-auto w-full text-center">
        <span>&copy; {new Date().getFullYear()} FinanceAI published by ZripeCrop</span>
      </div>

    </div>
  );
}