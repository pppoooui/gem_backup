"use client";

import Link from "next/link";
import { ArrowLeft, MonitorSmartphone, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

function getStorefrontUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configuredUrl) {
    return `${configuredUrl}/en`;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/en`;
  }

  return "/en";
}

export default function AdminPreviewPage() {
  const storefrontUrl = getStorefrontUrl();

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-slate-950">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          返回工作台
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <MonitorSmartphone className="size-5 text-[#005466]" />
            <h1 className="text-xl font-semibold">手机预览</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            扫码在真实手机上检查前台页面。
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="mb-4 flex items-center gap-2">
                <QrCode className="size-4 text-[#005466]" />
                <span className="text-sm font-medium">扫码预览</span>
              </div>
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
                <QRCodeSVG value={storefrontUrl} size={180} />
              </div>
              <p className="mt-3 font-mono text-xs text-slate-400">
                {storefrontUrl}
              </p>
            </div>

            {/* Sizes */}
            <div>
              <p className="mb-4 text-sm font-medium">
                建议检查这些宽度
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: "iPhone SE (375px)", w: 375 },
                  { label: "Galaxy S (360px)", w: 360 },
                  { label: "小屏手机（320px）", w: 320 },
                  { label: "平板（768px）", w: 768 },
                ].map(({ label, w }) => (
                  <a
                    key={w}
                    href={storefrontUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50"
                  >
                    <span className="font-medium">{label}</span>
                    <span className="font-mono text-xs text-slate-400">
                      {w}px
                    </span>
                  </a>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400">
                打开链接后，可以用浏览器开发者工具模拟不同设备宽度。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
