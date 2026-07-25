"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { changePasswordSchema, ChangePasswordFormData } from "@/lib/validations/auth";
import api, { getImageUrl } from "@/lib/axios";
import { useAuth } from "@/components/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    try {
      await api.put("/profile", data);
      await refreshProfile();
      setNameSuccess(true);
      resetNameForm(data);
      setTimeout(() => setNameSuccess(false), 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menyimpan nama");
    } finally {
      setNameLoading(false);
    }
  };

  const onPickPhoto = () => fileInputRef.current?.click();

  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    setPhotoLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshProfile();
    } catch (err: any) {
      setPhotoError(err.response?.data?.message || "Gagal mengunggah foto");
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDeletePhoto = async () => {
    if (!confirm("Hapus foto profil?")) return;
    setPhotoLoading(true);
    setPhotoError("");
    try {
      await api.delete("/profile/photo");
      await refreshProfile();
    } catch (err: any) {
      setPhotoError(err.response?.data?.message || "Gagal menghapus foto");
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
    } catch (err: any) {
      setPwServerError(err.response?.data?.message || "Terjadi kesalahan, coba lagi");
    } finally {
      setPwLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const photoUrl = getImageUrl(user?.profileImageUrl);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Pengaturan Akun</h1>
          <p className="text-[var(--color-muted)] mt-1">Kelola informasi profil dan keamanan kamu.</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Kolom kiri: kartu ringkasan profil, sticky di desktop */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:sticky md:top-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <button
                onClick={onPickPhoto}
                disabled={photoLoading}
                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center overflow-hidden ring-4 ring-[var(--background)]"
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
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
                  onClick={onDeletePhoto}
                  aria-label="Hapus foto"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPhotoSelected}
                className="hidden"
              />
            </div>

            <p className="font-semibold text-[var(--foreground)] mt-4 truncate max-w-full">
              {user?.fullName}
            </p>
            <p className="text-sm text-[var(--color-muted)] truncate max-w-full">{user?.email}</p>

            {photoError && <p className="text-red-500 text-xs mt-2">{photoError}</p>}
            <p className="text-xs text-[var(--color-muted)] mt-3">Klik foto untuk mengganti · JPG/PNG maks 2MB</p>
          </div>
        </div>

        {/* Kolom kanan: form-form pengaturan */}
        <div className="space-y-6">
          {/* Info Akun */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-7">
            <h2 className="font-semibold text-[var(--foreground)] mb-1">Informasi Akun</h2>
            <p className="text-sm text-[var(--color-muted)] mb-5">Nama ini akan tampil di seluruh aplikasi.</p>

            <form onSubmit={handleNameSubmit(onSaveName)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    {...registerName("fullName")}
                    type="text"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  />
                  {nameErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1.5">{nameErrors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                    Email
                  </label>
                  <input
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--color-muted)] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!nameDirty || nameLoading}
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  {nameLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                {nameSuccess && (
                  <span className="text-sm text-[var(--color-accent-dark)]">Tersimpan ✓</span>
                )}
              </div>
            </form>
          </div>

          {/* Ganti Password */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-7">
            <h2 className="font-semibold text-[var(--foreground)] mb-1">Ganti Password</h2>
            <p className="text-sm text-[var(--color-muted)] mb-5">
              Gunakan password yang kuat dan belum pernah dipakai sebelumnya.
            </p>

            <form onSubmit={handlePwSubmit(onSubmitPassword)} className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                    Password Saat Ini
                  </label>
                  <input
                    {...registerPw("currentPassword")}
                    type="password"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  />
                  {pwErrors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1.5">{pwErrors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                    Password Baru
                  </label>
                  <input
                    {...registerPw("newPassword")}
                    type="password"
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  />
                  {pwErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1.5">{pwErrors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    {...registerPw("confirmNewPassword")}
                    type="password"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  />
                  {pwErrors.confirmNewPassword && (
                    <p className="text-red-500 text-xs mt-1.5">{pwErrors.confirmNewPassword.message}</p>
                  )}
                </div>
              </div>

              {pwServerError && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                  {pwServerError}
                </div>
              )}
              {pwSuccess && (
                <div className="text-[var(--color-accent-dark)] text-sm bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-lg px-3 py-2">
                  {pwSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity active:scale-[0.98]"
              >
                {pwLoading ? "Menyimpan..." : "Ganti Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}