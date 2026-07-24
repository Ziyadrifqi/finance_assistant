"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  email: string;
  fullName: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    const fullName = localStorage.getItem("userFullName");

    if (!token) {
      router.replace("/login");
      return;
    }

    setUser({ email: email || "", fullName: fullName || "" });
    setLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFullName");
    router.replace("/login");
  };

  return { user, loading, logout };
}