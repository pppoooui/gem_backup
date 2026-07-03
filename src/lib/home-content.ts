export type HomeImage = {
  src: string;
  en: string;
  zh: string;
};

export type HomeMilestone = {
  year: string;
  image: string;
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
};

export type HomeCertificate = {
  image?: string;
  code: string;
  labelEn: string;
  labelZh: string;
};

export type HomeTestimonial = {
  image: string;
  quoteEn: string;
  quoteZh: string;
  nameEn: string;
  nameZh: string;
};

export type HomeContent = {
  aboutImage: HomeImage;
  milestones: HomeMilestone[];
  factoryImages: HomeImage[];
  certificates: HomeCertificate[];
  testimonials: HomeTestimonial[];
};

export const defaultHomeContent: HomeContent = {
  aboutImage: {
    src: "/media/dfcgem-lab.png",
    en: "DFCgem production and inspection facility",
    zh: "DFCgem 生产与检测工厂",
  },
  milestones: [
    { year: "1990", image: "/products/round-150mm.png", titleEn: "Craft foundations", titleZh: "早期工艺积累", bodyEn: "The first phase focused on stone knowledge, cutting references and stable supply basics.", bodyZh: "从宝石知识、切工参照与稳定供应基础开始积累。" },
    { year: "1995", image: "/products/round-premium.png", titleEn: "Quality references", titleZh: "建立品质参照", bodyEn: "Visual quality and grading references became more consistent across batches.", bodyZh: "逐步建立更一致的外观品质与批次分级参照。" },
    { year: "2000", image: "/products/princess-250mm.png", titleEn: "Fancy cuts introduced", titleZh: "异形切工拓展", bodyEn: "The range expanded from classic round stones into production-ready fancy cuts.", bodyZh: "产品从经典圆石逐步扩展至可量产的异形切工。" },
    { year: "2005", image: "/products/round-sizes.png", titleEn: "Calibrated sizing", titleZh: "校准尺寸体系", bodyEn: "Standard size references made manufacturing and repeat purchasing more predictable.", bodyZh: "统一尺寸参照，让生产镶嵌与重复补货更加可控。" },
    { year: "2010", image: "/products/round-parcel.png", titleEn: "Batch packing", titleZh: "批次包装标准化", bodyEn: "Batch labels, parcel standards and packing checks joined the regular workflow.", bodyZh: "批次标签、包货标准与包装检查纳入日常流程。" },
    { year: "2015", image: "/products/round-125mm.png", titleEn: "Precision range expanded", titleZh: "精密规格扩充", bodyEn: "More calibrated sizes and production-ready parcels joined the core collection.", bodyZh: "扩充校准尺寸与可直接投产的标准包货。" },
    { year: "2020", image: "/products/round-200mm.png", titleEn: "Wholesale workflow", titleZh: "完善批发流程", bodyEn: "Quantity tiers and clearer order handling improved recurring B2B purchasing.", bodyZh: "通过阶梯报价与清晰订单流程，提升长期 B2B 采购效率。" },
    { year: "2025", image: "/media/dfcgem-hero.png", titleEn: "Global catalog launch", titleZh: "全球商品目录上线", bodyEn: "A digital catalog connected products, MOQ, quoting and secure order lookup.", bodyZh: "上线数字化商品目录，打通产品、起订量、报价与订单查询。" },
    { year: "2026", image: "/media/dfcgem-lab.png", titleEn: "Quality lab upgrade", titleZh: "品质实验室升级", bodyEn: "Expanded optical inspection and batch-control capacity for repeat wholesale orders.", bodyZh: "扩充光学检测与批次管控能力，为长期批发订单提供稳定支持。" },
  ],
  factoryImages: [
    { src: "/media/dfcgem-lab.png", en: "Optical inspection laboratory", zh: "光学检测实验室" },
    { src: "/products/round-125mm.png", en: "Precision stone inspection", zh: "精密宝石检测" },
    { src: "/products/round-parcel.png", en: "Batch sorting and packing", zh: "批次分选与包装" },
    { src: "/products/round-sizes.png", en: "Calibrated size reference", zh: "校准尺寸参照" },
    { src: "/products/round-premium.png", en: "Premium cutting sample", zh: "精品切工样品" },
    { src: "/products/princess-250mm.png", en: "Fancy cut production", zh: "异形切工生产" },
  ],
  certificates: [
    { image: "", code: "ISO 9001", labelEn: "Quality Management", labelZh: "质量管理体系" },
    { image: "", code: "SGS", labelEn: "Material Inspection", labelZh: "材料检测记录" },
    { image: "", code: "REACH", labelEn: "Compliance Record", labelZh: "合规检测记录" },
    { image: "", code: "BSCI", labelEn: "Supplier Audit", labelZh: "供应商审核" },
    { image: "", code: "QC 18", labelEn: "Inspection Process", labelZh: "十八道质检" },
  ],
  testimonials: [
    { image: "/products/round-1mm.png", quoteEn: "The parcel sizes stay consistent, so replenishment is much easier for our setting line.", quoteZh: "尺寸批次很稳定，补货后给镶嵌产线使用更省心。", nameEn: "Mumbai jewelry manufacturer", nameZh: "孟买珠宝制造商" },
    { image: "/products/round-200mm.png", quoteEn: "Quotation, packing list and PI details are clear enough for repeat B2B orders.", quoteZh: "报价、装箱和 PI 信息清楚，适合长期重复采购。", nameEn: "Dubai wholesale buyer", nameZh: "迪拜批发客户" },
    { image: "/products/round-parcel.png", quoteEn: "Colorless batches match well and the MOQ is practical for mixed-size orders.", quoteZh: "白石批次匹配度好，混合尺寸订单的起订量也合理。", nameEn: "Bangkok accessory factory", nameZh: "曼谷饰品工厂" },
    { image: "/products/princess-250mm.png", quoteEn: "The team responds quickly when we need custom labels and export documents.", quoteZh: "需要定制标签和出口资料时，团队响应很及时。", nameEn: "Istanbul trading company", nameZh: "伊斯坦布尔贸易公司" },
  ],
};
