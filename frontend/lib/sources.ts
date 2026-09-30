export type SourceType = "BANK" | "EWALLET" | "CASH";

export interface PaymentSource {
  id: number;
  name: string;
  type: SourceType;
  color: string;
}

// Total per sumber dana (dari backend). id/type null = "Tanpa sumber" (data lama)
export interface SourceAmount {
  id: number | null;
  name: string;
  type: SourceType | null;
  color: string;
  total: number;
}

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  BANK: "Bank",
  EWALLET: "E-Wallet",
  CASH: "Tunai",
};

export const SOURCE_TYPE_ICON: Record<SourceType, string> = {
  BANK: "🏦",
  EWALLET: "📱",
  CASH: "💵",
};

export const SOURCE_PRESETS: { name: string; type: SourceType; color: string }[] = [
  { name: "BCA", type: "BANK", color: "#3b82f6" },
  { name: "BRI", type: "BANK", color: "#06b6d4" },
  { name: "Mandiri", type: "BANK", color: "#eab308" },
  { name: "BNI", type: "BANK", color: "#f97316" },
  { name: "GoPay", type: "EWALLET", color: "#10b981" },
  { name: "OVO", type: "EWALLET", color: "#7c3aed" },
  { name: "DANA", type: "EWALLET", color: "#3b82f6" },
  { name: "ShopeePay", type: "EWALLET", color: "#ef4444" },
  { name: "Tunai", type: "CASH", color: "#78716c" },
];