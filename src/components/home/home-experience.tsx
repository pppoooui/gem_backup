import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Camera,
  ChevronDown,
  Gem,
  Globe2,
  Languages,
  Mail,
  MapPin,
  Menu,
  Search,
  Share2,
  ShoppingBag,
  Video,
} from "lucide-react";
import { HistoryCarousel } from "@/components/home/history-carousel";
import { HomeScrollReset } from "@/components/home/home-scroll-reset";
import { PointerZoomImage } from "@/components/home/pointer-zoom-image";
import { factoryVideos } from "@/lib/factory-videos";
import { defaultHomeContent, type HomeContent } from "@/lib/home-content";
import {
  PUBLIC_CONTACT_EMAIL,
  PUBLIC_SITE_NAME,
} from "@/lib/site-config";
import type { Locale } from "@/types/domain";

const copy = {
  en: {
    home: "Home",
    about: "About us",
    collections: "Collections",
    story: "Brand story",
    service: "Services",
    contact: "Contact",
    shop: "Shop",
    language: "English",
    heroTitle: "About DFC Cubic Zirconia Factory",
    heroBody: "20 years. Real quality. Real partner.",
    heroSupporting: "Vivid Fire CZ, Upgrade Your Designs",
    company: "DFC Cubic Zirconia Factory",
    introTitle: "Hearts and Arrows CZ, made for lasting brilliance.",
    introBodyOne: "DFC Cubic Zirconia Factory is a professional manufacturer dedicated to Hearts and Arrows (H&A) cubic zirconia in all standard and custom sizes. With over 20 years of focused expertise, we specialize in 5A-grade CZ that delivers exceptional brilliance, fire, and light performance—designed to elevate your jewelry collections and boost product value.",
    introBodyTwo: "At DFC, we don’t just supply gemstones—we deliver value, trust, and long-term partnership to make your jewelry shine brighter.",
    founded: "20 YEARS OF FOCUSED EXPERTISE",
    factoryTitle: "Factory introduction",
    factoryBody: "Our precision-cut Hearts and Arrows zirconia ensures perfect symmetry, consistent quality, and outstanding sparkle for rings, earrings, necklaces, and fine fashion jewelry. For more than two decades, we have grown alongside global jewelry brands and manufacturers, providing reliable supply, stable quality, and tailored solutions that help our partners scale and succeed.",
    recognitionTitle: "Industry recognition",
    recognitionBody: "Quality systems, supplier audits and consistent batch control support our commitment to dependable wholesale supply.",
    recognitionSub: "CERTIFICATIONS · QUALITY RECORDS",
    testimonialsTitle: "Customer feedback",
    testimonialsBody: "Repeat buyers value consistent sizes, clear packing and responsive quotation support.",
    bannerTitle: "20 years strong. Always in stock.",
    bannerBody: "Vivid Fire CZ, Upgrade Your Designs",
    bannerCta: "Explore the collection",
    footerAbout: "About DFC Cubic Zirconia Factory",
    footerProduct: "Collections",
    footerService: "Services",
    footerContact: "Contact",
    footerAboutLinks: ["Company profile", "Our journey", "Factory", "Quality records"],
    footerProductLinks: ["Best sellers", "Round stones", "Colorless CZ", "Calibrated parcels"],
    footerServiceLinks: ["Wholesale supply", "Custom packing", "Shipping", "Payment"],
    subscribe: "Subscribe",
    subscribeHint: "Receive new product and wholesale updates.",
    emailPlaceholder: "Enter your email",
    copyright: "DFC Cubic Zirconia Factory. All rights reserved.",
  },
  zh: {
    home: "首页",
    about: "关于我们",
    collections: "产品系列",
    story: "品牌故事",
    service: "服务",
    contact: "联系我们",
    shop: "商城",
    language: "简体中文",
    heroTitle: "关于 DFC Cubic Zirconia Factory",
    heroBody: "20年，真品质，真伙伴",
    heroSupporting: "饱满火彩锆石，升级首饰款式质感",
    company: "DFC Cubic Zirconia Factory",
    introTitle: "专注八心八箭圆形白色锆石",
    introBodyOne: "DFC 锆石工厂是一家专业生产商，专注生产全常规尺寸及定制尺寸的八心八箭立方氧化锆石。我们拥有二十余年深耕行业的专业经验，主打 5A 级锆石，宝石拥有绝佳亮度、强火彩与出色的透光效果，专为提升您的首饰系列质感、拉高产品附加值而生。",
    introBodyTwo: "在 DFC，我们不止是宝石供应商，更为客户带去实实在在的价值、可靠的信任与长期共赢的合作，让您的首饰绽放更耀眼的光彩。",
    founded: "二十余年专注锆石制造",
    factoryTitle: "工厂介绍",
    factoryBody: "我们采用精密切割工艺打造八心八箭锆石，对称度完美、品质稳定，闪耀度出众，适用于戒指、耳饰、项链及各类时尚精品首饰。二十多年来，我们与全球各大首饰品牌、加工厂共同发展，提供稳定供货、恒定品质与定制化配套方案，助力合作客户拓展业务、发展壮大。",
    recognitionTitle: "行业认可",
    recognitionBody: "通过质量体系、供应商审核与稳定的批次管控，持续兑现可靠批发供应的承诺。",
    recognitionSub: "行业认证 · 品质记录",
    testimonialsTitle: "客户评价",
    testimonialsBody: "长期客户重视稳定尺寸、清晰包装与及时报价支持。",
    bannerTitle: "二十年实力，库存永远在线",
    bannerBody: "饱满火彩锆石，升级首饰款式质感",
    bannerCta: "查看产品系列",
    footerAbout: "关于 DFC Cubic Zirconia Factory",
    footerProduct: "产品系列",
    footerService: "服务",
    footerContact: "联系我们",
    footerAboutLinks: ["企业简介", "发展历程", "工厂介绍", "品质记录"],
    footerProductLinks: ["热销产品", "圆形宝石", "白色锆石", "校准包货"],
    footerServiceLinks: ["批发供应", "定制包装", "运输说明", "付款方式"],
    subscribe: "订阅",
    subscribeHint: "接收新品与批发资讯。",
    emailPlaceholder: "输入您的邮箱",
    copyright: "DFC Cubic Zirconia Factory 版权所有。",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span className="flex items-center gap-1">
        <Gem className={`size-5 ${light ? "text-white" : "text-[#9a6a3a]"}`} />
        <span className="text-[22px] font-semibold tracking-[0.16em]">DFC</span>
      </span>
      <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.12em] sm:text-[9px]">
        Cubic Zirconia Factory
      </span>
    </span>
  );
}

function Header({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const base = `/${locale}`;
  const languageSwitchLabel = locale === "en" ? "中文" : "English";

  return (
    <header className="bg-white text-[#181818]">
      <div className="mx-auto grid h-[76px] max-w-[1320px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
        <div className="hidden items-center gap-3 md:flex">
          {[Globe2, Camera, Share2, Video].map((Icon, index) => (
            <span key={index} className="grid size-8 place-items-center rounded-full border border-black/75"><Icon className="size-3.5" /></span>
          ))}
        </div>
        <Link href={base} aria-label={`${PUBLIC_SITE_NAME} home`} className="justify-self-center"><Brand /></Link>
        <div className="flex items-center justify-end gap-4 text-sm">
          <Link href={`${base}/products`} aria-label="Search products" className="hidden sm:block"><Search className="size-5" /></Link>
          <details className="group relative">
            <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden">
              <Languages className="size-4 sm:hidden" />
              <span>{languageSwitchLabel}</span>
              <ChevronDown className="hidden size-3.5 transition group-open:rotate-180 sm:block" />
            </summary>
            <div className="absolute right-0 top-10 z-40 min-w-32 border border-black/10 bg-white py-1 text-sm shadow-xl">
              <Link href="/en" className={`block px-4 py-2 hover:bg-[#f7f6f4] ${locale === "en" ? "text-[#9a6a3a]" : ""}`}>English</Link>
              <Link href="/zh" className={`block px-4 py-2 hover:bg-[#f7f6f4] ${locale === "zh" ? "text-[#9a6a3a]" : ""}`}>中文</Link>
            </div>
          </details>
          <Link href={`${base}/cart`} aria-label="Cart"><ShoppingBag className="size-5" /></Link>
        </div>
      </div>
      <nav className="border-t border-black/5 px-5 sm:px-8">
        <div className="mx-auto hidden h-[54px] max-w-4xl items-center justify-between text-[15px] md:flex">
          <Link href={base}>{t.home}</Link><Link href="#about" className="text-[#9a6a3a]">{t.about}</Link><Link href={`${base}/products`} className="inline-flex items-center gap-1">{t.collections}<ChevronDown className="size-3.5" /></Link><Link href="#history">{t.story}</Link><Link href="#factory">{t.service}</Link><Link href={`${base}/contact`}>{t.contact}</Link><Link href={`${base}/products`}>{t.shop}</Link>
        </div>
        <div className="flex h-12 items-center justify-between md:hidden">
          <span className="text-sm font-medium">{t.home}</span>
          <details className="group relative">
            <summary aria-label="Menu" className="grid size-9 list-none cursor-pointer place-items-center [&::-webkit-details-marker]:hidden"><Menu className="size-5" /></summary>
            <div className="absolute right-0 top-10 z-30 min-w-48 border border-black/10 bg-white py-2 shadow-xl">
              {[[t.about, "#about"], [t.story, "#history"], [t.service, "#factory"], [t.collections, `${base}/products`], [t.contact, `${base}/contact`]].map(([label, href]) => <Link key={label} href={href} className="block px-5 py-3 text-sm hover:bg-[#f7f6f4]">{label}</Link>)}
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}

export function HomeExperience({
  locale,
  content = defaultHomeContent,
}: {
  locale: Locale;
  content?: HomeContent;
}) {
  const t = copy[locale];
  const base = `/${locale}`;

  return (
    <main id="top" className="min-h-screen bg-white text-[#171717]">
      <HomeScrollReset />
      <Header locale={locale} />

      <section className="relative min-h-[290px] overflow-hidden sm:min-h-[330px]">
        <Image src="/media/dfcgem-hero.png" alt="Precision cut stones and pendant" fill priority loading="eager" fetchPriority="high" className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-black/28" />
        <div className="relative mx-auto flex min-h-[290px] max-w-5xl flex-col items-center justify-center px-6 text-center text-white sm:min-h-[330px]">
          <h1 className="text-3xl font-semibold sm:text-4xl">{t.heroTitle}</h1>
          <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-white/92 sm:text-base">{t.heroBody}</p>
          <p className="mt-1 max-w-3xl text-sm leading-7 text-white/78">{t.heroSupporting}</p>
        </div>
      </section>

      <div className="bg-[#f4f4f3] px-5 py-3 text-sm text-black/65 sm:px-8"><div className="mx-auto flex max-w-[1320px] items-center gap-3"><Link href={base}>{t.home}</Link><span className="text-black/25">/</span><span>{t.about}</span></div></div>

      <section id="about" className="mx-auto grid max-w-[1320px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-18">
        <div className="relative flex min-h-[480px] flex-col overflow-hidden">
          <p className="text-sm font-medium uppercase tracking-[0.12em]">{PUBLIC_SITE_NAME}</p>
          <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight">{t.company}</h2>
          <span className="pointer-events-none absolute inset-x-0 bottom-2 text-[210px] font-light leading-none text-[#9a6a3a]/5 sm:text-[260px]">D</span>
          <div className="mt-auto pb-3">
            <p className="text-[86px] font-light leading-none text-[#b58a61]/24 sm:text-[128px]">20+</p>
            <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[#9a6a3a]">{t.founded}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a6a3a]">{PUBLIC_SITE_NAME}</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{t.introTitle}</h2>
          <p className="mt-6 text-[15px] leading-8 text-black/68">{t.introBodyOne}</p>
          <p className="mt-5 text-[15px] leading-8 text-black/68">{t.introBodyTwo}</p>
          <PointerZoomImage
            src={content.aboutImage.src}
            alt={locale === "zh" ? content.aboutImage.zh : content.aboutImage.en}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="mt-8 aspect-[16/9]"
          />
        </div>
      </section>

      <section id="factory" className="py-14 sm:py-18">
        <div className="mx-auto max-w-[1840px] px-5 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">{t.factoryTitle}</h2>
            <p className="mt-5 text-sm leading-7 text-black/50">{t.factoryBody}</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {content.factoryImages.map((image) => <div key={image.src} className="relative aspect-[16/9] overflow-hidden bg-[#f2f1ef]"><Image src={image.src} alt={locale === "zh" ? image.zh : image.en} fill className="object-cover transition duration-700 hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" /></div>)}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {factoryVideos.map((video) => (
              <div key={video.src} className="h-[520px] overflow-hidden bg-black sm:h-[640px] xl:h-[720px]">
                <video
                  className="size-full object-contain"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  title={locale === "zh" ? video.titleZh : video.titleEn}
                >
                  <source src={video.src} type="video/mp4" />
                </video>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HistoryCarousel locale={locale} milestones={content.milestones} />

      <section id="recognition" className="bg-[#fafafa] py-14 sm:py-18">
        <div className="mx-auto max-w-[1840px] px-5 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">{t.recognitionTitle}</h2>
            <p className="mt-5 text-sm leading-7 text-black/50">{t.recognitionBody}</p>
            <p className="mt-7 text-sm font-semibold tracking-[0.18em] text-[#a97342]">{t.recognitionSub}</p>
          </div>
          <div className="mt-9 grid gap-4 overflow-x-auto pb-1 [grid-template-columns:repeat(5,minmax(220px,1fr))]">
            {content.certificates.map((item) => (
              <div key={item.code} className="relative flex aspect-[1.55] min-w-56 flex-col items-center justify-center overflow-hidden rounded-[2px] border border-black/6 bg-white px-5 text-center shadow-[0_16px_36px_rgba(0,0,0,0.04)]">
                <span className="absolute inset-5 border border-[#b58a61]/18" />
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={locale === "zh" ? item.labelZh : item.labelEn}
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 768px) 60vw, 20vw"
                  />
                ) : (
                  <>
                    <Award className="size-8 text-[#a97342]" strokeWidth={1.2} />
                    <p className="mt-4 text-2xl font-semibold tracking-[0.08em]">{item.code}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-black/42">{locale === "zh" ? item.labelZh : item.labelEn}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="bg-white py-14 sm:py-18">
        <div className="mx-auto max-w-[1840px] px-5 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">{t.testimonialsTitle}</h2>
            <p className="mt-5 text-sm leading-7 text-black/50">{t.testimonialsBody}</p>
          </div>
          <div className="mt-10 grid gap-5 overflow-x-auto pb-1 [grid-template-columns:repeat(4,minmax(260px,1fr))]">
            {content.testimonials.map((item) => (
              <article key={item.nameEn} className="min-w-64 overflow-hidden border border-black/7 bg-[#fbfbfa]">
                <div className="relative aspect-[4/3] bg-[#eee]">
                  <Image src={item.image} alt={locale === "zh" ? item.nameZh : item.nameEn} fill className="object-cover" sizes="(max-width: 768px) 80vw, 25vw" />
                </div>
                <div className="px-5 py-5">
                  <p className="text-[15px] leading-7 text-black/70">“{locale === "zh" ? item.quoteZh : item.quoteEn}”</p>
                  <p className="mt-5 text-sm font-semibold text-[#9a6a3a]">{locale === "zh" ? item.nameZh : item.nameEn}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="brand-banner" className="relative min-h-[360px] overflow-hidden text-white">
        <Image src="/media/dfcgem-hero.png" alt="Round colorless cubic zirconia collection" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-black/62" />
        <div className="relative mx-auto flex min-h-[360px] max-w-4xl flex-col items-center justify-center px-5 text-center sm:px-8">
          <h2 className="text-3xl font-semibold sm:text-4xl">{t.bannerTitle}</h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/78 sm:text-base">{t.bannerBody}</p>
          <Link href={`${base}/products`} className="mt-8 inline-flex h-12 items-center gap-3 border border-white/55 px-6 text-sm font-medium hover:bg-white hover:text-black">{t.bannerCta}<ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}

function Footer({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const base = `/${locale}`;
  return (
    <footer id="site-footer" className="bg-white px-5 pb-8 pt-10 sm:px-8">
      <div className="mx-auto flex max-w-[1320px] items-center gap-8"><span className="h-px flex-1 bg-black/8" /><Brand /><span className="h-px flex-1 bg-black/8" /></div>
      <div className="mx-auto mt-10 grid max-w-[1320px] gap-10 border-b border-black/10 pb-10 md:grid-cols-[0.8fr_0.8fr_0.8fr_1.4fr_1.5fr]">
        <FooterList title={t.footerAbout} items={t.footerAboutLinks as string[]} />
        <FooterList title={t.footerProduct} items={t.footerProductLinks as string[]} />
        <FooterList title={t.footerService} items={t.footerServiceLinks as string[]} />
        <div><h3 className="text-sm font-semibold">{t.footerContact}</h3><a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="mt-5 flex items-center gap-2 text-sm text-black/55"><Mail className="size-4" />{PUBLIC_CONTACT_EMAIL}</a><p className="mt-3 flex items-start gap-2 text-sm leading-6 text-black/55"><MapPin className="mt-1 size-4 shrink-0" />Singapore · Global fulfillment</p></div>
        <div><h3 className="text-sm font-semibold">{t.subscribe}</h3><p className="mt-4 text-sm text-black/48">{t.subscribeHint}</p><form className="mt-5 flex border border-black/18"><input type="email" aria-label={t.emailPlaceholder} placeholder={t.emailPlaceholder} className="min-w-0 flex-1 px-4 py-3 text-sm outline-none" /><button type="submit" className="bg-[#a97342] px-5 text-sm text-white">{t.subscribe}</button></form></div>
      </div>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-3 pt-6 text-xs text-black/38 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} {t.copyright}</p><Link href={`${base}/products`}>Wholesale CZ · Global fulfillment</Link></div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: string[] }) {
  return <div><h3 className="text-sm font-semibold">{title}</h3><ul className="mt-5 space-y-3 text-sm text-black/52">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}
