import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9f8] px-4">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <PackageSearch className="mx-auto size-12 text-[#005466]" />
        <h1 className="mt-6 text-3xl font-semibold text-[#002b35]">Page Not Found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-[#003f4b] px-5 text-sm font-semibold text-white hover:bg-[#002b35]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}