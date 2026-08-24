import type { Metadata } from "next";
import { CompliancePage, type ComplianceSection } from "@/components/storefront/compliance-page";
import { PUBLIC_CONTACT_EMAIL, PUBLIC_SITE_NAME } from "@/lib/site-config";
import type { Locale } from "@/types/domain";

type Props = { params: Promise<{ locale: Locale }> };

const content = {
  en: {
    eyebrow: "Website terms",
    title: "Terms of Service",
    summary: "These terms govern use of the DFC website and purchases of standard or custom cubic zirconia products. By placing an order, you agree to the confirmed order details and these terms.",
    sections: [
      { title: "Seller and website", paragraphs: [`This website is operated under the trading name ${PUBLIC_SITE_NAME}, Wuzhou, China. Website content, quotations, customer messages, and payment links are provided for legitimate product enquiries and purchases.`] },
      { title: "Products and specifications", paragraphs: ["Product images are representative. Natural differences in photography, screens, cutting batches, and permitted manufacturing tolerances may cause minor variation. Binding specifications are the shape, size, color, grade, quantity, tolerance, packing, and other requirements confirmed on the order page, quotation, or pro forma invoice."] },
      { title: "Quotations, prices, and orders", bullets: [
        "Unless otherwise stated, prices and final invoices are in United States dollars (USD).",
        "A cart submission or enquiry is not final acceptance. DFC may review stock, specifications, shipping, compliance, and pricing before confirming an order.",
        "An order becomes accepted when DFC confirms the final details and receives the required payment or deposit.",
        "Import duties, taxes, customs clearance, and local fees are the buyer's responsibility unless expressly included in writing.",
      ] },
      { title: "Payments", paragraphs: ["Payments may be processed by independent providers such as PingPong Checkout, LianLian Global, banks, or other methods displayed on the approved order page. DFC does not ask customers to send full card numbers through chat or email and does not store complete card details processed on a provider-hosted payment page. Payment is valid only through a verified DFC order page, invoice, or payment link."] },
      { title: "Custom orders", paragraphs: ["Custom sizes, colors, cuts, branding, or packaging may require a deposit and a separately confirmed production period. Once custom production starts, changes or cancellations may result in charges for completed work and committed materials."] },
      { title: "Shipping, title, and risk", paragraphs: ["Dispatch and delivery estimates are not guarantees. Carrier delay, customs review, weather, force majeure, or incomplete buyer information may affect delivery. Shipping responsibility and risk transfer follow the delivery term confirmed on the quotation or invoice. See the Shipping Policy for operational details."] },
      { title: "Returns and refunds", paragraphs: ["Returns, cancellations, damaged goods, and refunds are governed by the Return & Refund Policy and any specific written terms agreed on the final quotation or pro forma invoice."] },
      { title: "Acceptable use and intellectual property", paragraphs: ["You may not misuse the website, attempt unauthorized access, submit false information, interfere with service operation, or copy DFC branding, images, text, or product materials for unauthorized commercial use."] },
      { title: "Liability and disputes", paragraphs: ["To the maximum extent permitted by applicable law, DFC is not liable for indirect or consequential loss. Any direct claim is limited to the amount paid for the affected goods, except where such a limit is prohibited by law. The parties should first attempt to resolve disputes in good faith through written communication. Applicable mandatory consumer or commercial laws remain unaffected."] },
      { title: "Contact", paragraphs: [`Questions about these terms may be sent to ${PUBLIC_CONTACT_EMAIL}. We may update these terms when business, legal, or payment requirements change; the date shown above identifies the current version.`] },
    ] satisfies ComplianceSection[],
  },
  zh: {
    eyebrow: "网站条款",
    title: "服务条款",
    summary: "本条款适用于 DFC 网站的使用以及常规或定制立方氧化锆产品的购买。提交订单即表示您同意已确认的订单信息及本条款。",
    sections: [
      { title: "商家与网站", paragraphs: [`本网站以 ${PUBLIC_SITE_NAME} 名义运营，经营地点位于中国梧州。网站内容、报价、客户消息及付款链接仅用于合法的产品咨询和购买。`] },
      { title: "产品与规格", paragraphs: ["产品图片仅供展示。拍摄、屏幕显示、切割批次及允许的生产公差可能造成轻微差异。具有约束力的规格以订单页面、报价单或形式发票中确认的形状、尺寸、颜色、等级、数量、公差、包装及其他要求为准。"] },
      { title: "报价、价格与订单", bullets: [
        "除另有说明外，价格及最终发票均以美元（USD）计价。",
        "提交购物车或询盘并不代表最终接受；DFC 可在确认前审核库存、规格、运输、合规及价格。",
        "DFC 确认最终信息并收到约定付款或定金后，订单正式成立。",
        "除书面明确包含外，进口关税、税费、清关费及当地费用由买方承担。",
      ] },
      { title: "付款", paragraphs: ["付款可能由 PingPong Checkout、LianLian Global、银行或已批准订单页面展示的其他独立支付机构处理。DFC 不会要求客户通过聊天或邮件发送完整银行卡号，也不会存储在支付机构托管页面处理的完整卡片资料。请仅通过经验证的 DFC 订单页面、发票或付款链接付款。"] },
      { title: "定制订单", paragraphs: ["定制尺寸、颜色、切割、品牌或包装可能需要支付定金，并另行确认生产周期。定制生产开始后，变更或取消可能需要承担已完成工作和已投入材料的费用。"] },
      { title: "运输、所有权与风险", paragraphs: ["发货和送达时间均为预计时间而非保证。承运人延误、海关检查、天气、不可抗力或买方资料不完整可能影响交付。运输责任及风险转移以报价单或发票确认的交付条款为准，具体操作见运输政策。"] },
      { title: "退货与退款", paragraphs: ["取消、退货、破损商品及退款按照退货与退款政策以及最终报价单或形式发票中另行书面约定的条款处理。"] },
      { title: "合理使用与知识产权", paragraphs: ["不得滥用网站、尝试未授权访问、提交虚假信息、干扰服务运行，或未经授权将 DFC 的品牌、图片、文字及产品资料用于商业用途。"] },
      { title: "责任与争议", paragraphs: ["在适用法律允许的最大范围内，DFC 不承担间接或后果性损失。除法律禁止限制的情形外，任何直接索赔以受影响商品的已付款金额为限。双方应先通过书面沟通善意协商解决争议，适用的强制性消费者或商业法律不受影响。"] },
      { title: "联系我们", paragraphs: [`如对本条款有疑问，请联系 ${PUBLIC_CONTACT_EMAIL}。业务、法律或支付要求发生变化时，我们可能更新条款；页面顶部日期代表当前版本。`] },
    ] satisfies ComplianceSection[],
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? `服务条款 | ${PUBLIC_SITE_NAME}` : `Terms of Service | ${PUBLIC_SITE_NAME}`, description: content[locale].summary };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const page = content[locale];
  return <CompliancePage locale={locale} slug="terms" {...page} sections={[...page.sections]} />;
}
