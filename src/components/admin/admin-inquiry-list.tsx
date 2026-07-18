import { Mail, MessageCircle, MessagesSquare } from "lucide-react";
import { makeWhatsAppUrl, type AdminInquiry } from "@/lib/inquiries";

const statusLabels: Record<AdminInquiry["status"], string> = {
  new: "新询盘",
  contacted: "已联系",
  closed: "已关闭",
};

export function AdminInquiryList({ inquiries }: { inquiries: AdminInquiry[] }) {
  if (inquiries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-12 text-center">
        <MessagesSquare className="mx-auto size-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-500">暂时还没有客户询盘</p>
        <p className="mt-1 text-xs text-slate-400">首页的留言窗口提交后会显示在这里。</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">时间</th>
              <th className="px-5 py-3">规格与数量</th>
              <th className="px-5 py-3">联系方式</th>
              <th className="px-5 py-3">补充需求</th>
              <th className="px-5 py-3">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inquiries.map((inquiry) => {
              const whatsappUrl = makeWhatsAppUrl(
                inquiry.whatsapp,
                `Hello ${inquiry.contactName || ""}, thank you for your inquiry to DFC Cubic Zirconia Factory.`.trim(),
              );
              return (
                <tr key={inquiry.id} className="align-top transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                    {new Date(inquiry.createdAt).toLocaleString("en-SG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{inquiry.quantity.toLocaleString()} pcs</p>
                    <p className="mt-1 text-xs text-slate-500">{inquiry.sizeMm} · {inquiry.grade}</p>
                  </td>
                  <td className="px-5 py-4">
                    {inquiry.contactName ? <p className="font-medium">{inquiry.contactName}</p> : null}
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      <a href={`mailto:${inquiry.email}`} className="inline-flex items-center gap-1 text-[#005466] hover:underline"><Mail className="size-3" />{inquiry.email}</a>
                      {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#005466] hover:underline"><MessageCircle className="size-3" />{inquiry.whatsapp}</a> : <span>{inquiry.whatsapp}</span>}
                    </div>
                  </td>
                  <td className="max-w-sm whitespace-pre-wrap px-5 py-4 text-slate-600">{inquiry.notes || "-"}</td>
                  <td className="px-5 py-4"><span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium">{statusLabels[inquiry.status]}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
