"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { registerSchema, RegisterFormData } from "@/lib/validations/auth";
import api from "@/lib/axios";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  User,
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  PiggyBank,
  CheckCircle2,
  Zap,
  BarChart3,
  TrendingUp,
  Check
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");
  const confirmPasswordValue = watch("confirmPassword", "");

  // Indikator Kekuatan Password (Disesuaikan dengan min: 6 karakter di schema)
  const getPasswordStrength = () => {
    if (!passwordValue) return { label: "", score: 0, color: "bg-slate-700" };
    if (passwordValue.length < 6) return { label: "Sangat Lemah", score: 25, color: "bg-rose-500" };
    if (passwordValue.length < 8) return { label: "Cukup", score: 50, color: "bg-amber-500" };
    if (passwordValue.length < 12) return { label: "Kuat", score: 75, color: "bg-blue-500" };
    return { label: "Sangat Kuat", score: 100, color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    setLoading(true);
    try {
      // Hapus confirmPassword jika backend hanya butuh fullName, email, & password
      const { confirmPassword, ...payload } = data;
      await api.post("/auth/register", payload);
      router.push("/login?registered=true");
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || "Gagal mendaftar. Silakan periksa kembali data Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 font-sans transition-colors duration-300 bg-[var(--color-bg)] text-[var(--color-text)]">
      
      {/* ---------------------------------------------------- */}
      {/* KOLOM KIRI: Form Register                             */}
      {/* ---------------------------------------------------- */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 md:p-12 relative min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto lg:max-w-none">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-indigo-600/20">
              <PiggyBank className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-wide">FinanceAI</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 rounded-3xl shadow-xl transition-colors duration-300">
            
            <div className="space-y-2 mb-6 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Buat Akun Baru
              </h1>
              <p className="text-sm opacity-70">
                Bergabung untuk kelola dana darurat & investasi masa depan.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Server Error Alert */}
              {serverError && (
                <div className="flex items-center gap-3 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-70">
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50 group-focus-within:text-indigo-500 group-focus-within:opacity-100 transition-colors" />
                  <input
                    {...register("fullName")}
                    type="text"
                    placeholder="Masukkan Nama Anda"
                    className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-xs font-medium pl-1 mt-1">{errors.fullName.message}</p>
                )}
              </div>

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
                  <p className="text-red-500 text-xs font-medium pl-1 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-70">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50 group-focus-within:text-indigo-500 group-focus-within:opacity-100 transition-colors" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-12 pr-12 py-3 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {passwordValue && (
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

                {errors.password && (
                  <p className="text-red-500 text-xs font-medium pl-1 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-70">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50 group-focus-within:text-indigo-500 group-focus-within:opacity-100 transition-colors" />
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi password Anda"
                    className="w-full pl-12 pr-12 py-3 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity p-1"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Realtime Matching Status */}
                {confirmPasswordValue && !errors.confirmPassword && (
                  <p className="text-emerald-500 text-xs font-medium flex items-center gap-1 pl-1 mt-1">
                    <Check className="w-3.5 h-3.5" /> Password cocok
                  </p>
                )}

                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs font-medium pl-1 mt-1">{errors.confirmPassword.message}</p>
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
                    <span>Mempersiapkan Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Akun Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Login Callout */}
            <p className="text-center text-sm opacity-75 mt-6">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="text-indigo-500 font-bold hover:underline transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center text-xs opacity-60 pt-6 border-t border-[var(--color-border)] max-w-md mx-auto w-full lg:max-w-none text-center">
          <span>&copy; {new Date().getFullYear()} FinanceAI published by ZripeCrop</span>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* KOLOM KANAN: Showcase Keuangan                        */}
      {/* ---------------------------------------------------- */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 xl:p-12 text-white overflow-hidden border-l border-[var(--color-border)] bg-slate-950 shadow-2xl">
        
        {/* Background Image */}
        <Image
          src="/images/bg-regis.jpg"
          alt="Finance Register Background"
          fill
          priority
          className="object-cover object-center z-0 opacity-30"
        />

        {/* Overlay Indigo-Cyan Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/70 to-indigo-950/40 z-0" />

        {/* Header Kanan: Badge Kategori Clean */}
        <div className="relative z-10 flex items-center">
          <span className="text-[11px] font-bold text-indigo-300 tracking-widest uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full backdrop-blur-md">
            Smart Financial Journey
          </span>
        </div>

        {/* Hero Showcase Content */}
        <div className="relative z-10 space-y-6 my-auto py-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-medium text-indigo-300 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fitur Komplit Tanpa Langganan</span>
          </div>
          
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
            Langkah Pertama Menuju Kebebasan Finansial.
          </h2>
          
          <p className="text-slate-200 text-sm leading-relaxed max-w-sm drop-shadow-sm">
            Dapatkan analitik cerdas, klasifikasi transaksi instan, dan laporan keuangan rutin secara otomatis.
          </p>

          {/* PREVIEW CARD */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-5 space-y-3.5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider">Benefit Akun Baru</span>
              <span className="text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded text-[11px]">Selamanya</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Dashboard Interaktif & Real-Time</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Pencatatan Pemasukan & Pengeluaran Unlimited</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Target Tabungan & Dana Darurat Tracker</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Highlights: Grid 2 Kolom */}
        <div className="relative z-10 grid grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 justify-center">
            <BarChart3 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-medium text-center">Ekspor Laporan PDF/CSV</span>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 justify-center">
            <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-medium text-center">Analitik Real-Time</span>
          </div>
        </div>

      </div>

    </div>
  );
}