import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Akun | FinanceAI",
  description: "Buat akun baru untuk mulai mengelola keuangan dan tabungan Anda.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}