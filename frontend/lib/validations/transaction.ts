import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().min(1, "Icon wajib diisi"),
  color: z.string().min(1, "Warna wajib dipilih"),
});
export type CategoryFormData = z.infer<typeof categorySchema>;

export const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, "Jumlah wajib diisi")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Jumlah harus lebih dari 0"),
  note: z.string().optional(),
  transactionDate: z.string().min(1, "Tanggal wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
});
export type TransactionFormData = z.infer<typeof transactionSchema>;

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  limitAmount: z
    .string()
    .min(1, "Limit wajib diisi")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Limit harus lebih dari 0"),
});
export type BudgetFormData = z.infer<typeof budgetSchema>;