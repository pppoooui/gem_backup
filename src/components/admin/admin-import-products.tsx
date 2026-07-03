"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import type { ImportRow } from "@/app/api/admin/products/import/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type PreviewRow = ImportRow & { _valid: boolean; _error?: string };

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);

  return rows;
}

function normaliseHeaders(raw: string[][]): Record<string, number> {
  const map: Record<string, number> = {};
  for (let i = 0; i < raw[0].length; i++) {
    const key = raw[0][i].toLowerCase().trim();
    // common aliases
    if (key === "name" || key === "name_en") map.nameEn = i;
    else if (key === "name_zh") map.nameZh = i;
    else if (key === "material") map.material = i;
    else if (key === "cut") map.cut = i;
    else if (key === "grade") map.grade = i;
    else if (key === "hs_code") map.hsCode = i;
    else if (key === "size" || key === "size_mm") map.sizeMm = i;
    else if (key === "color") map.color = i;
    else if (key === "package_unit") map.packageUnit = i;
    else if (key === "moq") map.moq = i;
    else if (key === "price" || key === "price_usd") map.priceUsd = i;
    else if (key === "weight" || key === "weight_grams") map.weightGrams = i;
    else map[key] = i;
  }
  return map;
}

function parseRows(raw: string[][]): PreviewRow[] {
  if (raw.length < 2) return [];
  const headerMap = normaliseHeaders(raw);
  return raw.slice(1).map((row) => {
    const cell = (key: string) => row[headerMap[key]]?.trim() ?? "";
    const result: PreviewRow = {
      slug: cell("slug"),
      nameEn: cell("nameEn"),
      nameZh: cell("nameZh"),
      shape: cell("shape") || "Round",
      material: cell("material") || "Cubic Zirconia",
      cut: cell("cut") || "Brilliant",
      grade: ((["5A", "3A", "2A"].includes(cell("grade")) ? cell("grade") : "5A") as ImportRow["grade"]),
      hsCode: cell("hsCode"),
      sizeMm: cell("sizeMm"),
      color: cell("color") || "Colorless",
      packageUnit: cell("packageUnit") || "pcs",
      moq: Number(cell("moq")) || 500,
      priceUsd: Number(cell("priceUsd")) || 0,
      weightGrams: Number(cell("weightGrams")) || 0,
      _valid: false,
      _error: undefined,
    };

    if (!result.slug) result._error = "缺少 slug";
    else if (!result.nameEn) result._error = "缺少商品名称";
    else if (!result.shape) result._error = "缺少形状";
    else result._valid = true;

    return result;
  });
}

function toImportPayload(row: PreviewRow): ImportRow {
  return {
    slug: row.slug,
    nameEn: row.nameEn,
    nameZh: row.nameZh,
    shape: row.shape,
    material: row.material,
    cut: row.cut,
    grade: row.grade,
    hsCode: row.hsCode,
    sizeMm: row.sizeMm,
    color: row.color,
    packageUnit: row.packageUnit,
    moq: row.moq,
    priceUsd: row.priceUsd,
    weightGrams: row.weightGrams,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type ImportStage = "select" | "preview" | "result";

export function AdminImportProducts() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<ImportStage>("select");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; error?: string } | null>(null);

  const validCount = rows.filter((r) => r._valid).length;
  const errorCount = rows.length - validCount;

  // ----- file handling ------------------------------------------------------

  function reset() {
    setStage("select");
    setRows([]);
    setFileName("");
    setResult(null);
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setResult({
        imported: 0,
        error: "请先把表格导出为 CSV，再上传 .csv 文件。",
      });
      setStage("result");
      return;
    }

    try {
      const parsed = parseCsv(await file.text());
      if (parsed.length < 2) {
        setResult({ imported: 0, error: "文件里没有数据行" });
        setStage("result");
        return;
      }
      const preview = parseRows(parsed);
      setRows(preview);
      setStage("preview");
    } catch (err) {
      setResult({ imported: 0, error: (err as Error).message });
      setStage("result");
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function startImport() {
    setImporting(true);
    setResult(null);
    const valid = rows.filter((row) => row._valid).map(toImportPayload);
    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: valid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "未知错误");
      setResult(data);
      setStage("result");
    } catch (err) {
      setResult({ imported: 0, error: (err as Error).message });
      setStage("result");
    } finally {
      setImporting(false);
    }
  }

  // ----- render -------------------------------------------------------------

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">批量导入商品</h2>
          <p className="mt-1 text-sm text-slate-500">
            上传 CSV 文件，每一行对应一个商品规格。
          </p>
        </div>
        {stage !== "select" && (
          <button
            onClick={reset}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium"
          >
            <RotateCcw className="size-4" />
            重新导入
          </button>
        )}
      </div>

      {/* Stage: File Select */}
      {stage === "select" && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition ${
              dragging
                ? "border-[#003f4b] bg-[#eaf4f2]"
                : "border-slate-200 bg-white"
            }`}
          >
            <FileSpreadsheet className="mb-3 size-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              把 CSV 文件拖到这里
            </p>
            <p className="mt-1 text-xs text-slate-400">或</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-[#003f4b] px-4 text-sm font-semibold text-white"
            >
              <Upload className="size-4" />
              选择文件
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <p className="mt-4 text-xs text-slate-400">
              Excel 文件请先另存为 .csv 后再上传。
            </p>
          </div>

          <details className="rounded-md border border-slate-200 bg-white p-5">
            <summary className="cursor-pointer text-sm font-medium text-slate-500">
              需要的表头字段
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
              {[
                { col: "slug", required: true },
                { col: "name (or name_en)", required: true },
                { col: "name_zh", required: false },
                { col: "shape", required: true },
                { col: "material" },
                { col: "cut" },
                { col: "grade" },
                { col: "hs_code" },
                { col: "size (or size_mm)" },
                { col: "color" },
                { col: "package_unit" },
                { col: "moq" },
                { col: "price (or price_usd)" },
                { col: "weight (or weight_grams)" },
              ].map(({ col, required }) => (
                <span key={col} className="flex items-center gap-1.5">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                    {col}
                  </code>
                  {required && (
                    <span className="text-[10px] text-red-500">*</span>
                  )}
                </span>
              ))}
            </div>
          </details>
        </>
      )}

      {/* Stage: Preview */}
      {stage === "preview" && (
        <>
          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-5 py-3">
            <FileSpreadsheet className="size-5 text-slate-400" />
            <span className="text-sm font-medium">{fileName}</span>
            <span className="text-xs text-slate-400">
              {rows.length} 行 ·{" "}
              <span className="text-emerald-600">{validCount} 行可导入</span>
              {errorCount > 0 && (
                <span className="text-amber-600"> · {errorCount} 行有错误</span>
              )}
            </span>
            <button onClick={reset} className="ml-auto">
              <X className="size-4 text-slate-400" />
            </button>
          </div>

          <div className="overflow-auto rounded-md border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">名称</th>
                  <th className="px-3 py-2">形状</th>
                  <th className="px-3 py-2">尺寸</th>
                  <th className="px-3 py-2">起订量</th>
                  <th className="px-3 py-2">美元价格</th>
                  <th className="px-3 py-2">状态</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-t border-slate-100 ${
                      row._valid ? "" : "bg-red-50/30"
                    }`}
                  >
                    <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">{row.slug}</td>
                    <td className="px-3 py-2">{row.nameEn}</td>
                    <td className="px-3 py-2">{row.shape}</td>
                    <td className="px-3 py-2">{row.sizeMm}</td>
                    <td className="px-3 py-2">{row.moq}</td>
                    <td className="px-3 py-2">${row.priceUsd.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      {row._valid ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-xs text-red-600"
                          title={row._error}
                        >
                          <AlertTriangle className="size-3.5" />
                          {row._error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-5 py-3">
            <span className="text-sm text-slate-500">
              共 {rows.length} 行，其中 {validCount} 行可以导入。
            </span>
            <button
              disabled={validCount === 0 || importing}
              onClick={startImport}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#003f4b] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {importing ? (
                <>导入中...</>
              ) : (
                <>
                  <Upload className="size-4" />
                  导入 {validCount} 个商品
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Stage: Result */}
      {stage === "result" && result && (
        <div
          className={`rounded-md border p-6 ${
            result.error
              ? "border-red-200 bg-red-50"
              : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <div className="flex items-center gap-3">
            {result.error ? (
              <AlertTriangle className="size-6 text-red-500" />
            ) : (
              <CheckCircle2 className="size-6 text-emerald-600" />
            )}
            <div>
              <p className="font-semibold">
                {result.error ? "导入失败" : "导入完成"}
              </p>
              <p className="text-sm text-slate-600">
                {result.error ?? `${result.imported} 行已校验并成功导入。`}
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium"
          >
            <RotateCcw className="size-4" />
            继续导入其他文件
          </button>
        </div>
      )}
    </section>
  );
}
