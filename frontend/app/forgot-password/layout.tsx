import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Password",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}