import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9f8]">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="size-8 animate-spin text-[#005466]" />
        <p className="text-sm font-medium">Loading…</p>
      </div>
    </main>
  );
}