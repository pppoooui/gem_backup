"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ImagePlus, RotateCcw, Save } from "lucide-react";
import { defaultHomeContent, type HomeContent } from "@/lib/home-content";

type ImageTarget =
  | { section: "about" }
  | { section: "milestones"; index: number }
  | { section: "factoryImages"; index: number }
  | { section: "certificates"; index: number }
  | { section: "testimonials"; index: number };

export function AdminHomeContent() {
  const [content, setContent] = useState<HomeContent>(defaultHomeContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    async function loadContent() {
      try {
        const res = await fetch("/api/admin/content");
        const data = await res.json();
        if (active && res.ok) setContent(data.content ?? defaultHomeContent);
      } catch {
        if (active) setStatus("正在使用默认首页内容。");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadContent();
    return () => {
      active = false;
    };
  }, []);

  async function saveContent() {
    setSaving(true);
    setStatus("正在保存首页内容...");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "首页内容保存失败");
      setStatus(data.mode === "supabase" ? "首页内容已保存。" : "内容已校验。配置 Supabase 环境变量后才会持久保存。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "首页内容保存失败");
    } finally {
      setSaving(false);
    }
  }

  function setImage(target: ImageTarget, src: string) {
    setContent((current) => {
      if (target.section === "about") {
        return { ...current, aboutImage: { ...current.aboutImage, src } };
      }
      if (target.section === "milestones") {
        const milestones = [...current.milestones];
        milestones[target.index] = { ...milestones[target.index], image: src };
        return { ...current, milestones };
      }
      if (target.section === "factoryImages") {
        const factoryImages = [...current.factoryImages];
        factoryImages[target.index] = { ...factoryImages[target.index], src };
        return { ...current, factoryImages };
      }
      if (target.section === "certificates") {
        const certificates = [...current.certificates];
        certificates[target.index] = { ...certificates[target.index], image: src };
        return { ...current, certificates };
      }
      const testimonials = [...current.testimonials];
      testimonials[target.index] = { ...testimonials[target.index], image: src };
      return { ...current, testimonials };
    });
  }

  async function uploadImage(file: File, target: ImageTarget, key: string) {
    setUploadingKey(key);
    setStatus("正在上传图片...");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("folder", "home");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.publicUrl) throw new Error(data.error ?? "图片上传失败");
      setImage(target, data.publicUrl);
      setStatus("图片已上传，保存首页内容后发布。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "图片上传失败");
    } finally {
      setUploadingKey("");
    }
  }

  function updateFactory(index: number, patch: Partial<HomeContent["factoryImages"][number]>) {
    setContent((current) => {
      const factoryImages = [...current.factoryImages];
      factoryImages[index] = { ...factoryImages[index], ...patch };
      return { ...current, factoryImages };
    });
  }

  function updateMilestone(index: number, patch: Partial<HomeContent["milestones"][number]>) {
    setContent((current) => {
      const milestones = [...current.milestones];
      milestones[index] = { ...milestones[index], ...patch };
      return { ...current, milestones };
    });
  }

  function updateCertificate(index: number, patch: Partial<HomeContent["certificates"][number]>) {
    setContent((current) => {
      const certificates = [...current.certificates];
      certificates[index] = { ...certificates[index], ...patch };
      return { ...current, certificates };
    });
  }

  function updateTestimonial(index: number, patch: Partial<HomeContent["testimonials"][number]>) {
    setContent((current) => {
      const testimonials = [...current.testimonials];
      testimonials[index] = { ...testimonials[index], ...patch };
      return { ...current, testimonials };
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">首页内容管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            不改代码也可以更换首页图片、发展历程、工厂图、证书和客户评价。
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setContent(defaultHomeContent)}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold"
          >
            <RotateCcw className="size-4" />
            恢复默认
          </button>
          <button
            type="button"
            onClick={saveContent}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#003f4b] px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? "保存中..." : "保存内容"}
          </button>
        </div>
      </div>

      {status && <p className="rounded-md bg-white px-4 py-3 text-sm text-slate-600">{status}</p>}
      {loading ? <p className="rounded-md bg-white p-6 text-sm text-slate-500">正在加载内容...</p> : null}

      <EditorPanel title="公司介绍主图">
        <ImageEditor
          image={content.aboutImage.src}
          title={content.aboutImage.en}
          uploading={uploadingKey === "about"}
          onUpload={(file) => uploadImage(file, { section: "about" }, "about")}
          onPath={(src) => setImage({ section: "about" }, src)}
        />
      </EditorPanel>

      <EditorPanel title="发展历程 - 9 张图">
        <div className="grid gap-4 lg:grid-cols-3">
          {content.milestones.map((item, index) => (
            <div key={item.year} className="rounded-md border border-slate-200 bg-white p-3">
              <ImageEditor
                image={item.image}
                title={item.year}
                uploading={uploadingKey === `milestone-${index}`}
                onUpload={(file) => uploadImage(file, { section: "milestones", index }, `milestone-${index}`)}
                onPath={(image) => updateMilestone(index, { image })}
              />
              <div className="mt-3 grid gap-2">
                <SmallInput label="年份" value={item.year} onChange={(year) => updateMilestone(index, { year })} />
                <SmallInput label="英文标题" value={item.titleEn} onChange={(titleEn) => updateMilestone(index, { titleEn })} />
                <SmallInput label="中文标题" value={item.titleZh} onChange={(titleZh) => updateMilestone(index, { titleZh })} />
              </div>
            </div>
          ))}
        </div>
      </EditorPanel>

      <EditorPanel title="工厂介绍 - 6 张图">
        <div className="grid gap-4 lg:grid-cols-3">
          {content.factoryImages.map((item, index) => (
            <div key={`${item.src}-${index}`} className="rounded-md border border-slate-200 bg-white p-3">
              <ImageEditor
                image={item.src}
                title={item.en}
                uploading={uploadingKey === `factory-${index}`}
                onUpload={(file) => uploadImage(file, { section: "factoryImages", index }, `factory-${index}`)}
                onPath={(src) => updateFactory(index, { src })}
              />
              <div className="mt-3 grid gap-2">
                <SmallInput label="英文图片说明" value={item.en} onChange={(en) => updateFactory(index, { en })} />
                <SmallInput label="中文图片说明" value={item.zh} onChange={(zh) => updateFactory(index, { zh })} />
              </div>
            </div>
          ))}
        </div>
      </EditorPanel>

      <EditorPanel title="行业认可 - 5 项">
        <div className="grid gap-3 md:grid-cols-5">
          {content.certificates.map((item, index) => (
            <div key={`${item.code}-${index}`} className="rounded-md border border-slate-200 bg-white p-3">
              <ImageEditor
                image={item.image || "/media/certificate-placeholder.svg"}
                title={item.labelEn || item.code}
                uploading={uploadingKey === `certificate-${index}`}
                onUpload={(file) => uploadImage(file, { section: "certificates", index }, `certificate-${index}`)}
                onPath={(image) => updateCertificate(index, { image })}
                contain
              />
              <div className="mt-3 grid gap-2">
              <SmallInput label="编号" value={item.code} onChange={(code) => updateCertificate(index, { code })} />
              <SmallInput label="英文名称" value={item.labelEn} onChange={(labelEn) => updateCertificate(index, { labelEn })} />
              <SmallInput label="中文名称" value={item.labelZh} onChange={(labelZh) => updateCertificate(index, { labelZh })} />
              </div>
            </div>
          ))}
        </div>
      </EditorPanel>

      <EditorPanel title="客户评价 - 4 张卡片">
        <div className="grid gap-4 lg:grid-cols-4">
          {content.testimonials.map((item, index) => (
            <div key={`${item.nameEn}-${index}`} className="rounded-md border border-slate-200 bg-white p-3">
              <ImageEditor
                image={item.image}
                title={item.nameEn}
                uploading={uploadingKey === `testimonial-${index}`}
                onUpload={(file) => uploadImage(file, { section: "testimonials", index }, `testimonial-${index}`)}
                onPath={(image) => updateTestimonial(index, { image })}
              />
              <div className="mt-3 grid gap-2">
                <SmallInput label="英文姓名" value={item.nameEn} onChange={(nameEn) => updateTestimonial(index, { nameEn })} />
                <SmallInput label="中文姓名" value={item.nameZh} onChange={(nameZh) => updateTestimonial(index, { nameZh })} />
                <TextArea label="英文评价" value={item.quoteEn} onChange={(quoteEn) => updateTestimonial(index, { quoteEn })} />
                <TextArea label="中文评价" value={item.quoteZh} onChange={(quoteZh) => updateTestimonial(index, { quoteZh })} />
              </div>
            </div>
          ))}
        </div>
      </EditorPanel>
    </section>
  );
}

function ImageEditor({
  image,
  title,
  uploading,
  contain = false,
  onUpload,
  onPath,
}: {
  image: string;
  title: string;
  uploading: boolean;
  contain?: boolean;
  onUpload: (file: File) => void;
  onPath: (path: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
      <div className="relative aspect-[16/10] bg-white">
        <Image
          src={image}
          alt={title}
          fill
          className={contain ? "object-contain p-4" : "object-cover"}
          sizes="360px"
        />
      </div>
      <label className="flex cursor-pointer items-center justify-center gap-2 border-t border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-white">
        <ImagePlus className="size-4" />
        {uploading ? "上传中..." : "上传图片"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.currentTarget.value = "";
          }}
        />
      </label>
      <input
        value={image}
        onChange={(event) => onPath(event.target.value)}
        className="h-9 w-full border-t border-slate-200 bg-white px-3 text-xs outline-none"
      />
    </div>
  );
}

function EditorPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function SmallInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold text-slate-500">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full rounded-md border border-slate-200 px-2 text-sm font-normal text-slate-900 outline-none"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold text-slate-500">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-20 w-full rounded-md border border-slate-200 px-2 py-2 text-sm font-normal text-slate-900 outline-none"
      />
    </label>
  );
}
