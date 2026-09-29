import type { Metadata } from "next";
import { DashboardShell } from "@/components/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Pantau tren keuangan, skor kesehatan finansial, dan analisa AI pengeluaran Anda.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}