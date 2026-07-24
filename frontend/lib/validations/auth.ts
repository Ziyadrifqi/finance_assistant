import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Nama lengkap wajib diisi"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginFormData = z.infer<typeof loginSchema>;