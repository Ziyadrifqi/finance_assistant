"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Preloader } from "@/components/Preloader";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const timer = setTimeout(() => {
      if (token) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [router]);

  return <Preloader />;
}