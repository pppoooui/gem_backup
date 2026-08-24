import type { Metadata } from "next";
import { CompliancePage, type ComplianceSection } from "@/components/storefront/compliance-page";
import { PUBLIC_CONTACT_EMAIL, PUBLIC_SITE_NAME } from "@/lib/site-config";
import type { Locale } from "@/types/domain";

type Props = { params: Promise<{ locale: Locale }> };

const content = {
  en: {
    eyebrow: "Customer protection",
    title: "Return & Refund Policy",
    summary: "This policy explains cancellations, return eligibility, damaged or incorrect goods, and refund timing for DFC standard and custom cubic zirconia orders.",
    sections: [
      {
        title: "Order cancellation",
        paragraphs: ["Contact us as soon as possible if you need to cancel. A standard-stock order may be cancelled before dispatch. A custom order may be cancelled before material preparation or production begins. Once custom production, cutting, engraving, branded packing, or dispatch has started, related costs may be non-refundable."],
      },
      {
        title: "Eligible returns",
        paragraphs: ["For standard-stock products, request a return authorization within 7 calendar days after confirmed delivery. Items must be unused, unmounted, undamaged, and returned with the original parcel labels, batch identification, and packaging. Do not return goods without written authorization."],
      },
      {
        title: "Damaged, defective, or incorrect goods",
        paragraphs: ["Inspect the parcel promptly. If goods arrive damaged, materially defective, or different from the confirmed specification or quantity, email us within 48 hours after delivery. Include the order number, shipping label, clear photos, and an unboxing video when available. We will review the evidence and offer replacement, partial refund, or full refund as appropriate."],
      },
      {
        title: "Non-returnable items",
        bullets: [
          "Custom-cut stones, special sizes, custom colors, engraved items, and customer-branded packaging, except where defective or inconsistent with the confirmed order.",
          "Goods that have been mounted, mixed with another batch, altered, damaged after delivery, or returned without their batch identification.",
          "Clearance or final-sale items identified as non-returnable before payment.",
        ],
      },
      {
        title: "Return shipping and inspection",
        paragraphs: ["For an approved return caused by our error or a verified defect, DFC will provide instructions and bear reasonable return-shipping costs. For an approved change-of-mind return, the buyer is responsible for tracked return shipping, duties, and insurance. Returned goods are inspected before a refund is approved."],
      },
      {
        title: "Refund timing",
        paragraphs: ["Approved refunds are initiated to the original payment method within 5 business days after inspection or written approval. Banks and payment providers may require an additional 5–15 business days to post the funds. Original shipping, customs duties, and payment-processing costs are refundable only when required by law or when the return is caused by our verified error."],
      },
      {
        title: "How to request support",
        paragraphs: [`Email ${PUBLIC_CONTACT_EMAIL} with your order number, reason, requested resolution, and supporting photos or video. For negotiated B2B orders, any return terms expressly written on the final quotation or pro forma invoice will apply together with this policy.`],
      },
    ] satisfies ComplianceSection[],
  },
  zh: {
    eyebrow: "客户保障",
    title: "退货与退款政策",
    summary: "本政策说明 DFC 常规及定制锆石订单的取消、退货条件、损坏或错货处理以及退款时间。",
    sections: [
      {
        title: "取消订单",
        paragraphs: ["如需取消，请尽快联系我们。常规现货订单可在发货前申请取消；定制订单可在备料或生产开始前申请取消。定制生产、切割、刻字、品牌包装或发货已经开始后，已经发生的相关费用可能无法退还。"],
      },
      {
        title: "可退货商品",
        paragraphs: ["常规现货商品须在确认签收后 7 个自然日内申请退货授权。商品须保持未使用、未镶嵌、无损坏，并保留原包货标签、批次识别和包装。未经书面同意请勿自行寄回。"],
      },
      {
        title: "破损、质量问题或错货",
        paragraphs: ["请在收货后及时检查。如商品在运输中破损、存在重大质量问题，或与已确认规格或数量不符，请在签收后 48 小时内发送邮件，并提供订单号、快递面单、清晰照片及可提供的开箱视频。核实后，我们将根据情况提供补发、部分退款或全额退款。"],
      },
      {
        title: "不支持无理由退货的商品",
        bullets: [
          "定制切割、特殊尺寸、定制颜色、刻字及客户品牌包装商品，但经核实存在缺陷或与确认订单不符的除外。",
          "已经镶嵌、与其他批次混合、改动、收货后损坏或丢失批次标识的商品。",
          "付款前已明确标注不可退的清仓或最终销售商品。",
        ],
      },
      {
        title: "退货运费与检验",
        paragraphs: ["因我方错误或经核实的商品缺陷而批准的退货，由 DFC 提供寄回说明并承担合理退货运费。因买方改变主意而批准的退货，由买方承担可追踪的退货运费、税费及保险。退款前我们会对退回商品进行检验。"],
      },
      {
        title: "退款时间",
        paragraphs: ["退款经检验或书面批准后，将在 5 个工作日内原路发起。银行或支付机构可能还需要 5–15 个工作日入账。原始运费、关税及支付手续费仅在法律要求或经核实由我方错误导致退货时退还。"],
      },
      {
        title: "申请方式",
        paragraphs: [`请发送邮件至 ${PUBLIC_CONTACT_EMAIL}，注明订单号、申请原因、期望处理方式，并附相关照片或视频。协商成交的 B2B 订单，如最终报价单或形式发票另有明确退货条款，则该书面条款与本政策共同适用。`],
      },
    ] satisfies ComplianceSection[],
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? `退货与退款政策 | ${PUBLIC_SITE_NAME}` : `Return & Refund Policy | ${PUBLIC_SITE_NAME}`,
    description: content[locale].summary,
  };
}

export default async function ReturnRefundPolicyPage({ params }: Props) {
  const { locale } = await params;
  const page = content[locale];
  return <CompliancePage locale={locale} slug="return-refund-policy" {...page} sections={[...page.sections]} />;
}
