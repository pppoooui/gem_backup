"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImagePlus, Trash2, type LucideIcon } from "lucide-react";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";

type ManagedProduct = {
  slug: string;
  nameEn: string;
  shape: string;
  sizeMm: string;
  moq: number;
  priceUsd: number;
  imagePath: string;
};

const starterProducts: ManagedProduct[] = products.map((product) => ({
  slug: product.slug,
  nameEn: product.nameEn,
  shape: product.shape,
  sizeMm: product.variants[0]?.sizeMm ?? "",
  moq: product.variants[0]?.moq ?? 0,
  priceUsd: product.variants[0]?.priceTiers[0]?.priceUsd ?? 0,
  imagePath: product.imagePath,
}));

const blankProduct: ManagedProduct = {
  slug: "",
  nameEn: "",
  shape: "Round",
  sizeMm: "",
  moq: 500,
  priceUsd: 0,
  imagePath: "/products/round-1mm.png",
};

export function AdminProductManager() {
  const [managedProducts, setManagedProducts] =
    useState<ManagedProduct[]>(starterProducts);
  const [draftProduct, setDraftProduct] =
    useState<ManagedProduct>(blankProduct);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [mode, setMode] = useState<"fallback" | "supabase" | "validated-only">("fallback");
  const previewImagePath = draftProduct.imagePath || blankProduct.imagePath;

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        if (!active || !res.ok) return;
        setManagedProducts(data.products ?? starterProducts);
        setMode(data.mode ?? "fallback");
      } catch {
        if (active) setMode("fallback");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  async function addDraftProduct() {
    if (!draftProduct.slug || !draftProduct.nameEn) return;
    setSaving(true);
    setStatusMessage("正在保存商品...");

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftProduct),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "商品保存失败");
      const savedProduct = (data.product ?? draftProduct) as ManagedProduct;

      setManagedProducts((current) => [
        savedProduct,
        ...current.filter((item) => item.slug !== savedProduct.slug),
      ]);
      setSelectedSlug(savedProduct.slug);
      setDraftProduct(blankProduct);
      setMode(data.mode ?? mode);
      setStatusMessage(
        data.mode === "supabase"
          ? "商品已保存到 Supabase。"
          : "商品已在本地预览校验。配置 Supabase 环境变量后才会持久保存。",
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "商品保存失败");
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  }

  function startNewProduct() {
    setSelectedSlug(null);
    setDraftProduct(blankProduct);
    setStatusMessage("");
  }

  function selectProduct(product: ManagedProduct) {
    setSelectedSlug(product.slug);
    setDraftProduct(product);
    setStatusMessage("");
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setStatusMessage("正在上传图片...");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("folder", "products");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.publicUrl) {
        throw new Error(data.error ?? "图片上传失败");
      }
      setDraftProduct((current) => ({ ...current, imagePath: data.publicUrl }));
      setStatusMessage("图片已上传，保存商品后生效。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "图片上传失败");
    } finally {
      setUploading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  }

  async function removeProduct(slug: string) {
    const previous = managedProducts;
    setManagedProducts((current) => current.filter((item) => item.slug !== slug));

    try {
      const res = await fetch(`/api/admin/products?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "商品删除失败");
      setMode(data.mode ?? mode);
      if (selectedSlug === slug) startNewProduct();
      setStatusMessage(
        data.mode === "supabase"
          ? "商品已归档。"
          : "商品已从本地预览移除。",
      );
    } catch (error) {
      setManagedProducts(previous);
      setStatusMessage(error instanceof Error ? error.message : "商品删除失败");
    } finally {
      setTimeout(() => setStatusMessage(""), 4000);
    }
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">商品管理</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {mode === "supabase" ? "Supabase" : "本地预览"}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          编辑商品、上传封面图、归档暂不销售的 SKU。
        </p>
      </div>
      <div className="grid gap-5 p-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {selectedSlug ? "编辑商品" : "新增商品"}
            </h3>
            <button
              type="button"
              onClick={startNewProduct}
              className="h-8 rounded-md border border-slate-200 px-3 text-xs font-semibold"
            >
              新建
            </button>
          </div>
          <AdminInput
            label="Slug"
            value={draftProduct.slug}
            onChange={(value) =>
              setDraftProduct((current) => ({ ...current, slug: value }))
            }
          />
          <AdminInput
            label="商品名称"
            value={draftProduct.nameEn}
            onChange={(value) =>
              setDraftProduct((current) => ({ ...current, nameEn: value }))
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <AdminInput
              label="形状"
              value={draftProduct.shape}
              onChange={(value) =>
                setDraftProduct((current) => ({ ...current, shape: value }))
              }
            />
            <AdminInput
              label="尺寸"
              value={draftProduct.sizeMm}
              onChange={(value) =>
                setDraftProduct((current) => ({ ...current, sizeMm: value }))
              }
            />
            <AdminInput
              label="起订量"
              type="number"
              value={String(draftProduct.moq)}
              onChange={(value) =>
                setDraftProduct((current) => ({
                  ...current,
                  moq: Number(value) || 0,
                }))
              }
            />
            <AdminInput
              label="美元单价"
              type="number"
              value={String(draftProduct.priceUsd)}
              onChange={(value) =>
                setDraftProduct((current) => ({
                  ...current,
                  priceUsd: Number(value) || 0,
                }))
              }
            />
          </div>
          <AdminInput
            label="图片地址"
            value={draftProduct.imagePath}
            onChange={(value) =>
              setDraftProduct((current) => ({
                ...current,
                imagePath: value,
              }))
            }
          />
          <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            <div className="relative aspect-[16/10] bg-white">
              <Image
                src={previewImagePath}
                alt={draftProduct.nameEn || "商品图片预览"}
                fill
                priority
                className="object-cover"
                sizes="360px"
              />
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 border-t border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-white">
              <ImagePlus className="size-4" />
              {uploading ? "上传中..." : "上传 / 更换图片"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadImage(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>
          <button
            className="h-10 w-full rounded-md bg-[#003f4b] text-sm font-semibold text-white disabled:opacity-50"
            onClick={addDraftProduct}
            disabled={saving}
          >
            {saving ? "保存中..." : selectedSlug ? "保存修改" : "添加商品"}
          </button>
          {statusMessage && (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
              {statusMessage}
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-md border border-slate-200">
          <div className="grid grid-cols-[1.3fr_0.55fr_0.55fr_0.55fr_42px] bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            <span>商品</span>
            <span>形状</span>
            <span>尺寸</span>
            <span>起订量</span>
            <span />
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="px-3 py-6 text-sm text-slate-400">
                正在加载商品...
              </div>
            ) : managedProducts.map((product) => (
              <div
                key={product.slug}
                className={cn(
                  "grid grid-cols-[1.3fr_0.55fr_0.55fr_0.55fr_42px] items-center border-t border-slate-100 px-3 py-2 text-sm",
                  selectedSlug === product.slug && "bg-[#f0f8f7]",
                )}
              >
                <button
                  type="button"
                  onClick={() => selectProduct(product)}
                  className="flex min-w-0 items-center gap-3 text-left"
                >
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-md bg-slate-100">
                    <Image
                      src={product.imagePath}
                      alt={product.nameEn}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {product.nameEn}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {product.slug}
                    </span>
                  </span>
                </button>
                <span>{product.shape}</span>
                <span>{product.sizeMm}</span>
                <span>{product.moq}</span>
                <button
                  className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-50"
                  onClick={() => removeProduct(product.slug)}
                  aria-label={`删除 ${product.nameEn}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ActionCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "amber" | "emerald" | "sky" | "slate";
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <button className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span>
        <span className="block text-sm font-medium text-slate-500">
          {label}
        </span>
        <span className="mt-1 block text-lg font-semibold">{value}</span>
      </span>
      <span className={cn("grid size-11 place-items-center rounded-md", tones[tone])}>
        <Icon className="size-5" />
      </span>
    </button>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal outline-none"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
