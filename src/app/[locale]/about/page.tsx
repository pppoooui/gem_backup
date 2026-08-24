import type { Metadata } from "next";
import { CompliancePage, type ComplianceSection } from "@/components/storefront/compliance-page";
import { PUBLIC_SITE_NAME } from "@/lib/site-config";
import type { Locale } from "@/types/domain";

type Props = { params: Promise<{ locale: Locale }> };

const content = {
  en: {
    eyebrow: "Company profile",
    title: "About DFC Cubic Zirconia Factory",
    summary: "DFC is a cubic zirconia manufacturer and wholesale supplier based in Wuzhou, China, serving jewelry makers, brands, wholesalers, and trading partners worldwide.",
    sections: [
      {
        title: "What we manufacture",
        paragraphs: ["We focus on Hearts and Arrows cubic zirconia, including standard and custom millimeter sizes, colorless and colored stones, calibrated parcels, fancy shapes, and customer-specified cutting and packing requirements."],
      },
      {
        title: "Manufacturing experience",
        paragraphs: ["Our team has more than 20 years of focused industry experience. Production controls cover crystal selection, precision cutting, polishing, grading, calibrated sizing, batch inspection, and export packing."],
      },
      {
        title: "Wholesale service",
        bullets: [
          "Factory-direct quotations in USD for standard and custom specifications.",
          "Sample, mixed-size, and bulk-order support subject to the confirmed quotation.",
          "Custom labels, packing, product photos, and export-document support when agreed before production.",
          "Order communication through the website, email, WhatsApp, and LINE.",
        ],
      },
      {
        title: "Our commitment",
        paragraphs: ["We aim to provide clear specifications, consistent batches, transparent quotations, realistic shipping estimates, and responsive after-sales support. Final specifications, quantities, prices, production times, and delivery terms are confirmed on the order page, quotation, or pro forma invoice before payment."],
      },
    ] satisfies ComplianceSection[],
  },
  zh: {
    eyebrow: "企业简介",
    title: "关于 DFC 立方氧化锆工厂",
    summary: "DFC 是位于中国梧州的立方氧化锆生产及批发供应商，为全球首饰制造商、品牌、批发商及贸易伙伴提供产品与服务。",
    sections: [
      {
        title: "我们的产品",
        paragraphs: ["我们专注八心八箭立方氧化锆，供应常规及定制毫米尺寸、白色及彩色锆石、校准包货、异形石，并支持按客户要求进行切割和包装。"],
      },
      {
        title: "制造经验",
        paragraphs: ["团队拥有二十余年行业经验，生产管理覆盖晶体选料、精密切割、抛光、分级、尺寸校准、批次检验及出口包装。"],
      },
      {
        title: "批发服务",
        bullets: [
          "以美元提供常规及定制规格的工厂直供报价。",
          "根据最终确认的报价支持样品、混合尺寸及批量订单。",
          "可在生产前协商定制标签、包装、产品照片及出口资料。",
          "支持通过网站、电子邮件、WhatsApp 和 LINE 沟通订单。",
        ],
      },
      {
        title: "我们的承诺",
        paragraphs: ["我们致力于提供清晰规格、稳定批次、透明报价、合理运输时效和及时售后支持。最终规格、数量、价格、生产周期及交付条款以付款前确认的订单页面、报价单或形式发票为准。"],
      },
    ] satisfies ComplianceSection[],
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? `关于我们 | ${PUBLIC_SITE_NAME}` : `About Us | ${PUBLIC_SITE_NAME}`,
    description: content[locale].summary,
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const page = content[locale];
  return <CompliancePage locale={locale} slug="about" {...page} sections={[...page.sections]} />;
}
