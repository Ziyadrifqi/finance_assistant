import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Masuk ke akun Anda untuk mengakses dashboard.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}