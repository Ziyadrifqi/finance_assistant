"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { changePasswordSchema, ChangePasswordFormData } from "@/lib/validations/auth";
import api, { getImageUrl } from "@/lib/axios";
import { useAuth } from "@/components/AuthProvider";
import { PageHeader } from "@/components/PageHeader";

const nameSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
});
type NameFormData = z.infer<typeof nameSchema>;

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function ProfilePage() {
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  const [pwServerError, setPwServerError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const {
    register: registerName,
    handleSubmit: handleNameSubmit,
    formState: { errors: nameErrors, isDirty: nameDirty },
    reset: resetNameForm,
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    values: { fullName: user?.fullName || "" },
  });

  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    reset: resetPwForm,
    formState: { errors: pwErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSaveName = async (data: NameFormData) => {
    setNameLoading(true);
    setNameSuccess(false);
    setNameError("");
    try {
      await api.put("/profile", data);
      await refreshProfile();
      setNameSuccess(true);
      resetNameForm(data);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      setNameError(err.response?.data?.message || "Gagal menyimpan perubahan nama.");
    } finally {
      setNameLoading(false);
    }
  };

  const onPickPhoto = () => fileInputRef.current?.click();

  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");

    // Client-side Validation: Ukuran dan Tipe File
    if (!file.type.startsWith("image/")) {
      setPhotoError("Format file harus berupa gambar (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Ukuran gambar tidak boleh melebihi 2MB.");
      return;
    }

    setPhotoLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshProfile();
    } catch (err: any) {
      setPhotoError(err.response?.data?.message || "Gagal mengunggah foto profil.");
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDeletePhoto = async () => {
    if (!confirm("Apakah kamu yakin ingin menghapus foto profil?")) return;
    setPhotoLoading(true);
    setPhotoError("");
    try {
      await api.delete("/profile/photo");
      await refreshProfile();
    } catch (err: any) {
      setPhotoError(err.response?.data?.message || "Gagal menghapus foto profil.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordFormData) => {
    setPwServerError("");
    setPwSuccess("");
    setPwLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPwSuccess("Password berhasil diubah.");
      resetPwForm();
      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err: any) {
      setPwServerError(err.response?.data?.message || "Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setPwLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const photoUrl = getImageUrl(user?.profileImageUrl);

  return (
    <div className="w-full px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Pengaturan Akun"
        subtitle="Kelola informasi profil, foto, dan keamanan kata sandi kamu."
      />

      <div className="grid md:grid-cols-[280px_1fr] gap-5 sm:gap-6 items-start">
        {/* Ringkasan Profil (Kartu Kiri) */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 sm:p-6 shadow-xs md:sticky md:top-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <button
                type="button"
                onClick={onPickPhoto}
                disabled={photoLoading}
                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center overflow-hidden ring-4 ring-[var(--background)] cursor-pointer disabled:cursor-wait"
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-semibold text-2xl">{getInitials(user?.fullName)}</span>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                {photoLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </button>

              {photoUrl && !photoLoading && (
                <button
                  type="button"
                  onClick={onDeletePhoto}
                  aria-label="Hapus foto profil"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={onPhotoSelected}
                className="hidden"
              />
            </div>

            <p className="font-semibold text-[var(--foreground)] mt-4 truncate max-w-full">
              {user?.fullName || "Pengguna"}
            </p>
            <p className="text-xs text-[var(--color-muted)] truncate max-w-full mt-0.5">{user?.email}</p>

            {photoError && <p className="text-rose-500 text-xs mt-2.5 font-medium">{photoError}</p>}
            <p className="text-[11px] text-[var(--color-muted)] mt-3">
              Klik foto untuk mengganti · PNG, JPG, WebP maks 2MB
            </p>
          </div>
        </div>

        {/* Form Pengaturan (Kolom Kanan) */}
        <div className="space-y-5 sm:space-y-6">
          {/* Informasi Akun */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 sm:p-6 shadow-xs">
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-1">Informasi Profil</h2>
            <p className="text-xs text-[var(--color-muted)] mb-5">
              Nama ini akan ditampilkan pada aktivitas dan laporan keuanganmu.
            </p>

            <form onSubmit={handleNameSubmit(onSaveName)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    {...registerName("fullName")}
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  />
                  {nameErrors.fullName && (
                    <p className="text-rose-500 text-xs mt-1.5">{nameErrors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                    Alamat Email
                  </label>
                  <input
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--background)] text-[var(--color-muted)] opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>

              {nameError && (
                <p className="text-rose-500 text-xs font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
                  {nameError}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={!nameDirty || nameLoading}
                  className="text-xs font-medium px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  {nameLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                {nameSuccess && (
                  <span className="text-xs font-medium text-[var(--color-accent-dark)] animate-fade-in">
                    Tersimpan ✓
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Keamanan & Kata Sandi */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 sm:p-6 shadow-xs">
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-1">Keamanan & Password</h2>
            <p className="text-xs text-[var(--color-muted)] mb-5">
              Perbarui kata sandi secara berkala untuk menjaga keamanan akunmu.
            </p>

            <form onSubmit={handlePwSubmit(onSubmitPassword)} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Password Saat Ini
                </label>
                <input
                  {...registerPw("currentPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
                {pwErrors.currentPassword && (
                  <p className="text-rose-500 text-xs mt-1.5">{pwErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                    Password Baru
                  </label>
                  <input
                    {...registerPw("newPassword")}
                    type="password"
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  />
                  {pwErrors.newPassword && (
                    <p className="text-rose-500 text-xs mt-1.5">{pwErrors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    {...registerPw("confirmNewPassword")}
                    type="password"
                    placeholder="Ulangi password baru"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  />
                  {pwErrors.confirmNewPassword && (
                    <p className="text-rose-500 text-xs mt-1.5">{pwErrors.confirmNewPassword.message}</p>
                  )}
                </div>
              </div>

              {pwServerError && (
                <div className="text-rose-500 text-xs font-medium bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl px-3 py-2.5">
                  {pwServerError}
                </div>
              )}
              {pwSuccess && (
                <div className="text-[var(--color-accent-dark)] text-xs font-medium bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-xl px-3 py-2.5">
                  {pwSuccess}
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="text-xs font-medium px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
                >
                  {pwLoading ? "Menyimpan..." : "Ganti Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}