import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Password - FinanceAI",
  description: "Atur ulang kata sandi akun FinanceAI Anda secara aman.",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}