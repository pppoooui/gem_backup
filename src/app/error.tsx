"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9f8] px-4">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <TriangleAlert className="mx-auto size-12 text-amber-500" />
        <h1 className="mt-6 text-3xl font-semibold text-[#002b35]">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          An unexpected error occurred. Please try again or contact us on WhatsApp.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex h-11 items-center rounded-md bg-[#003f4b] px-5 text-sm font-semibold text-white hover:bg-[#002b35]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-md border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}