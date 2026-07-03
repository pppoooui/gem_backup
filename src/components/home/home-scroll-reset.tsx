"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function HomeScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    window.history.scrollRestoration = "manual";
    const scrollTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    scrollTop();
    const frame = window.requestAnimationFrame(scrollTop);
    const timers = [80, 220, 520].map((delay) => window.setTimeout(scrollTop, delay));
    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);

  return null;
}
