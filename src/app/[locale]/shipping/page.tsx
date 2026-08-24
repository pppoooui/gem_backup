import type { Metadata } from "next";
import { CompliancePage, type ComplianceSection } from "@/components/storefront/compliance-page";
import { PUBLIC_CONTACT_EMAIL, PUBLIC_SITE_NAME } from "@/lib/site-config";
import type { Locale } from "@/types/domain";

type Props = { params: Promise<{ locale: Locale }> };

const content = {
  en: {
    eyebrow: "Delivery information",
    title: "Shipping Policy",
    summary: "DFC ships wholesale and custom cubic zirconia orders internationally from our designated factory or warehouse. Final methods, costs, and delivery terms are confirmed before payment.",
    sections: [
      { title: "Order processing", paragraphs: ["In-stock orders are normally prepared within 2–5 business days after final specifications, shipping details, and payment are confirmed. Custom or high-volume orders follow the production time stated on the quotation or pro forma invoice. Processing time is separate from carrier transit time."] },
      { title: "Shipping methods and estimates", bullets: [
        "International express or air freight: typically 5–14 business days after dispatch.",
        "Sea freight for eligible bulk orders: typically 30–45 days port-to-port after dispatch.",
        "Other carriers, customer courier accounts, freight forwarders, or delivery terms may be used when confirmed in writing.",
      ] },
      { title: "Shipping charges", paragraphs: ["Shipping charges are calculated from destination, parcel weight and dimensions, insurance, service level, and any agreed handling. The final charge is displayed on the confirmed order, secure payment page, quotation, or invoice before payment. Unless explicitly stated, product prices do not include freight, import duties, or local taxes."] },
      { title: "Tracking and delivery", paragraphs: ["When tracking is available, the tracking number or shipping documents are sent through the order page, email, WhatsApp, or LINE. The buyer is responsible for providing an accurate recipient name, telephone number, email, and complete delivery address. Contact us before dispatch to request an address correction."] },
      { title: "Customs, duties, and import compliance", paragraphs: ["The buyer is responsible for destination-country import eligibility, customs duties, taxes, brokerage, clearance fees, permits, and local compliance unless the confirmed delivery term expressly states otherwise. Customs delays are outside DFC's direct control."] },
      { title: "Delays, loss, and damaged parcels", paragraphs: ["Delivery dates are estimates and may be affected by carrier operations, customs, weather, holidays, force majeure, or incomplete recipient information. If tracking shows an unusual delay, contact us and we will assist with a carrier enquiry. For visible loss or damage, preserve all packaging and report it within 48 hours after delivery with photos and, where available, an unboxing video."] },
      { title: "Contact", paragraphs: [`For a shipping quotation or delivery issue, contact ${PUBLIC_CONTACT_EMAIL} and include your order number and destination country.`] },
    ] satisfies ComplianceSection[],
  },
  zh: {
    eyebrow: "交付信息",
    title: "运输政策",
    summary: "DFC 从指定工厂或仓库向全球发送批发及定制立方氧化锆订单。最终运输方式、费用及交付条款均在付款前确认。",
    sections: [
      { title: "订单处理", paragraphs: ["现货订单通常在最终规格、收货资料及付款确认后的 2–5 个工作日内备货。定制或大批量订单按照报价单或形式发票注明的生产周期执行。处理时间不包含承运人运输时间。"] },
      { title: "运输方式与预计时效", bullets: [
        "国际快递或空运：发货后通常为 5–14 个工作日。",
        "符合条件的大宗订单海运：发货后通常为 30–45 天港到港。",
        "经书面确认后，也可使用其他承运人、客户快递账号、货运代理或约定交付条款。",
      ] },
      { title: "运输费用", paragraphs: ["运费根据目的地、包裹重量和尺寸、保险、服务等级及约定操作费用计算。最终费用会在付款前显示于确认订单、安全付款页面、报价单或发票中。除明确说明外，商品价格不包含运费、进口关税及当地税费。"] },
      { title: "追踪与收货", paragraphs: ["如运输方式支持追踪，我们会通过订单页面、邮件、WhatsApp 或 LINE 发送运单号或运输文件。买方须提供准确的收件人、电话、邮箱及完整地址。如需修改地址，请务必在发货前联系我们。"] },
      { title: "海关、税费与进口合规", paragraphs: ["除已确认交付条款另有明确说明外，买方负责目的国进口资格、关税、税费、代理费、清关费、许可证及当地合规要求。海关造成的延误不在 DFC 直接控制范围内。"] },
      { title: "延误、丢失与破损", paragraphs: ["送达时间为预计时间，可能受承运人运营、海关、天气、节假日、不可抗力或收件资料不完整影响。如物流追踪出现异常延误，请联系我们协助查询。发现包裹丢失或明显破损时，请保留全部包装，并在签收后 48 小时内提供照片及可提供的开箱视频。"] },
      { title: "联系我们", paragraphs: [`如需运费报价或处理运输问题，请联系 ${PUBLIC_CONTACT_EMAIL}，并提供订单号和目的国家。`] },
    ] satisfies ComplianceSection[],
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? `运输政策 | ${PUBLIC_SITE_NAME}` : `Shipping Policy | ${PUBLIC_SITE_NAME}`, description: content[locale].summary };
}

export default async function ShippingPage({ params }: Props) {
  const { locale } = await params;
  const page = content[locale];
  return <CompliancePage locale={locale} slug="shipping" {...page} sections={[...page.sections]} />;
}
