import type { Metadata } from "next";
import { CompliancePage, type ComplianceSection } from "@/components/storefront/compliance-page";
import { PUBLIC_CONTACT_EMAIL, PUBLIC_SITE_NAME } from "@/lib/site-config";
import type { Locale } from "@/types/domain";

type Props = { params: Promise<{ locale: Locale }> };

const content = {
  en: {
    eyebrow: "Data protection",
    title: "Privacy Policy",
    summary: "This policy explains what information DFC collects through this website, why it is used, when it is shared, and the choices available to customers and visitors.",
    sections: [
      { title: "Information we collect", bullets: [
        "Contact and business information, including name, company, email, telephone, WhatsApp or LINE details.",
        "Order and transaction information, including products, specifications, quantities, shipping address, invoices, payment provider, payment status, and refund status.",
        "Messages, enquiries, quotation requests, customer-service records, and files you choose to provide.",
        "Basic technical and usage information such as IP address, browser, device, language, time, requested pages, cookies, and security logs.",
      ] },
      { title: "How we use information", bullets: [
        "To answer enquiries, prepare quotations, process orders, arrange shipping, and provide after-sales service.",
        "To authenticate account access, keep order and chat records, prevent fraud, and protect the website.",
        "To process and reconcile payments, chargebacks, refunds, tax, accounting, and legal records.",
        "To improve products and website operation and, where permitted, send business updates that can be unsubscribed from.",
      ] },
      { title: "Payment information", paragraphs: ["Card and payment details entered on a provider-hosted page are processed directly by that provider, which may include PingPong Checkout, LianLian Global, banks, or another method selected for the order. DFC may receive transaction references and payment status but does not store the complete card number, card security code, or provider account password."] },
      { title: "When information is shared", paragraphs: ["We share only what is reasonably needed with payment processors, banks, carriers, customs or logistics providers, hosting and database suppliers, professional advisers, and authorities when required by law. We do not sell personal information. Service providers may process information in countries different from yours and are expected to protect it under their contracts and applicable law."] },
      { title: "Cookies and website data", paragraphs: ["The website may use essential cookies or local storage for language, cart, login, security, and session functions. Payment providers and linked services may set their own cookies under their privacy notices. You can restrict cookies in your browser, although essential website functions may then be unavailable."] },
      { title: "Retention and security", paragraphs: ["We keep records only as long as reasonably required for orders, support, fraud prevention, accounting, tax, contractual, and legal obligations. We use access controls, encrypted connections, restricted administrative access, and reputable service providers, but no internet transmission or storage system can be guaranteed completely secure."] },
      { title: "Your choices and rights", paragraphs: [`Depending on applicable law, you may request access, correction, deletion, restriction, or a copy of personal information, or object to certain uses. You may also withdraw marketing consent. Send requests to ${PUBLIC_CONTACT_EMAIL}; we may need to verify your identity and retain information required for legal or transaction records.`] },
      { title: "Children and updates", paragraphs: ["This B2B website is not directed to children, and we do not knowingly collect information from children. We may update this policy when our services, providers, or legal requirements change. The date above identifies the current version."] },
    ] satisfies ComplianceSection[],
  },
  zh: {
    eyebrow: "数据保护",
    title: "隐私政策",
    summary: "本政策说明 DFC 通过本网站收集哪些信息、使用原因、共享情形，以及客户和访客可以行使的选择与权利。",
    sections: [
      { title: "我们收集的信息", bullets: [
        "联系人及企业信息，包括姓名、公司、邮箱、电话、WhatsApp 或 LINE 联系方式。",
        "订单与交易信息，包括商品、规格、数量、收货地址、发票、支付机构、付款及退款状态。",
        "消息、询盘、报价请求、客服记录及您主动提供的文件。",
        "基本技术及使用信息，例如 IP 地址、浏览器、设备、语言、时间、访问页面、Cookie 和安全日志。",
      ] },
      { title: "信息用途", bullets: [
        "回复咨询、制作报价、处理订单、安排运输并提供售后服务。",
        "验证账户访问、保存订单和聊天记录、防止欺诈并保护网站安全。",
        "处理及核对付款、拒付、退款、税务、会计及法律记录。",
        "改进产品和网站运营，并在法律允许及获得同意时发送可退订的业务资讯。",
      ] },
      { title: "支付信息", paragraphs: ["客户在支付机构托管页面填写的银行卡及付款资料由该机构直接处理，可能包括 PingPong Checkout、LianLian Global、银行或订单选择的其他方式。DFC 可能收到交易编号及付款状态，但不会存储完整卡号、卡片安全码或支付账户密码。"] },
      { title: "信息共享", paragraphs: ["我们仅在合理必要范围内向支付机构、银行、承运人、海关或物流服务商、托管及数据库供应商、专业顾问和依法有权的机构共享信息。我们不会出售个人信息。服务商可能在您所在国家以外处理信息，并应根据合同和适用法律采取保护措施。"] },
      { title: "Cookie 与网站数据", paragraphs: ["网站可能使用必要 Cookie 或本地存储以实现语言、购物车、登录、安全和会话功能。支付机构及外部链接服务可能根据其隐私声明设置 Cookie。您可以在浏览器中限制 Cookie，但部分必要功能可能无法使用。"] },
      { title: "保存期限与安全", paragraphs: ["我们仅在订单、客服、防欺诈、会计、税务、合同及法律义务合理需要的期限内保存记录。我们采用访问控制、加密连接、受限后台权限及可靠服务商，但任何互联网传输或存储系统均无法保证绝对安全。"] },
      { title: "您的选择与权利", paragraphs: [`根据适用法律，您可以申请访问、更正、删除、限制处理或获取个人信息副本，或反对特定用途，也可撤回营销同意。请联系 ${PUBLIC_CONTACT_EMAIL}；我们可能需要核实身份，并保留法律或交易记录要求的信息。`] },
      { title: "未成年人及政策更新", paragraphs: ["本网站主要面向企业客户，不以未成年人为目标，也不会故意收集未成年人信息。服务、供应商或法律要求变化时，我们可能更新本政策，页面顶部日期代表当前版本。"] },
    ] satisfies ComplianceSection[],
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? `隐私政策 | ${PUBLIC_SITE_NAME}` : `Privacy Policy | ${PUBLIC_SITE_NAME}`, description: content[locale].summary };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const page = content[locale];
  return <CompliancePage locale={locale} slug="privacy" {...page} sections={[...page.sections]} />;
}
