"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import api from "@/lib/axios";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  TrendingUp,
  PieChart,
  Receipt,
  PiggyBank,
  CheckCircle2,
  Target
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userEmail", response.data.email);
      localStorage.setItem("userFullName", response.data.fullName);
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || "Email atau password salah. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 font-sans transition-colors duration-300 bg-[var(--color-bg)] text-[var(--color-text)]">
      
      {/* ---------------------------------------------------- */}
      {/* KOLOM KIRI: Showcase Keuangan (Versi Target Tabungan) */}
      {/* ---------------------------------------------------- */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 xl:p-12 text-white overflow-hidden border-r border-[var(--color-border)] bg-slate-950 shadow-2xl">
        
        {/* Background Image */}
        <Image
          src="/images/bg-auth.jpg"
          alt="Finance Background"
          fill
          priority
          className="object-cover object-center z-0 opacity-40"
        />

        {/* Overlay Gelap Transparan */}
        <div className="absolute inset-0 bg-slate-950/60 z-0" />

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl border border-indigo-500 shadow-lg">
            <PiggyBank className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wide text-white block leading-tight">
              FinanceAI
            </span>
            <span className="text-[10px] text-indigo-300 tracking-widest uppercase font-semibold">
              Personal Money Manager
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-6 my-auto py-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium text-emerald-300 backdrop-blur-md">
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pencatatan Keuangan Otomatis</span>
          </div>
          
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
            Atur Pengeluaran & Tabungan Lebih Terukur.
          </h2>
          
          <p className="text-slate-200 text-sm leading-relaxed max-w-sm drop-shadow-sm">
            Pantau arus kas harian, buat batasan budget bulanan, dan capai target keuangan Anda dengan ringkasan yang jelas.
          </p>

          {/* CARD PREVIEW VERSI 2: Target Dana Darurat */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20">
                  <Target className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="font-semibold text-slate-200">Target Dana Darurat</span>
              </div>
              <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[11px]">
                75% Terkumpul
              </span>
            </div>

<<<<<<< Updated upstream
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="Masukkan password"
                className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
              )}
=======
            <div className="text-2xl xl:text-3xl font-black tracking-tight text-white">
              Rp 15.000.000 <span className="text-xs font-normal text-slate-400">/ Rp 20.000.000</span>
>>>>>>> Stashed changes
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
              <div className="bg-indigo-500 h-full w-[75%] rounded-full" />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-300 pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sisa Rp 5.000.000 lagi untuk mencapai target!</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 grid grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/80">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">Laporan Arus Kas</span>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/80">
            <PieChart className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-medium">Kategori Budget Fleksibel</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* KOLOM KANAN: Form Login                               */}
      {/* ---------------------------------------------------- */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 md:p-12 relative min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto lg:max-w-none">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold shadow-md">
              <PiggyBank className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-wide">FinanceAI</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 rounded-3xl shadow-xl transition-colors duration-300">
            
            <div className="space-y-2 mb-6 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Selamat Datang
              </h1>
              <p className="text-sm opacity-70">
                Masuk untuk memantau arus kas dan budget keuangan Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Server Error Alert */}
              {serverError && (
                <div className="flex items-center gap-3 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{serverError}</span>
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
                    className="w-full pl-12 pr-4 py-3.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs font-medium pl-1 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider opacity-70">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-indigo-500 hover:underline transition-colors"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50 group-focus-within:text-indigo-500 group-focus-within:opacity-100 transition-colors" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                {errors.password && (
                  <p className="text-red-500 text-xs font-medium pl-1 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold py-3.5 px-4 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Membuka Wallet...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Register Callout */}
            <p className="text-center text-sm opacity-75 mt-6">
              Belum mulai catat keuangan?{" "}
              <Link
                href="/register"
                className="text-indigo-500 font-bold hover:underline transition-colors"
              >
                Daftar gratis di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center text-xs opacity-60 pt-6 border-t border-[var(--color-border)] max-w-md mx-auto w-full lg:max-w-none text-center">
          <span>&copy; {new Date().getFullYear()} FinanceAI published by ZripeCrop</span>
        </div>

      </div>

    </div>
  );
}