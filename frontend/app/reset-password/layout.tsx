import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - FinanceAI",
  description: "Buat password baru untuk akun FinanceAI Anda.",
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}