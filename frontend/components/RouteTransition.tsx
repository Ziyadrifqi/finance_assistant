"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Preloader } from "./Preloader";

export function RouteTransition() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50">
      <Preloader />
    </div>
  );
}