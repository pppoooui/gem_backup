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
    src: "/media/dfc-hearts-arrows.png",
    en: "Hearts and Arrows cutting pattern viewed from the bottom and top",
    zh: "八心八箭切工的底部与顶部效果",
  },
  milestones: [
    { year: "1995", image: "/products/round-150mm.png", titleEn: "Craft foundations", titleZh: "早期工艺积累", bodyEn: "The factory began building cutting references for round colorless cubic zirconia.", bodyZh: "工厂开始积累圆形白色锆石的切工与品质参照。" },
    { year: "2000", image: "/products/round-premium.png", titleEn: "Quality references", titleZh: "建立品质参照", bodyEn: "Visual grading and brilliance standards became more consistent across batches.", bodyZh: "逐步建立稳定一致的外观、亮度与批次分级标准。" },
    { year: "2005", image: "/media/dfc-hearts-arrows-comparison.png", titleEn: "Hearts and Arrows focus", titleZh: "专注八心八箭", bodyEn: "Precision symmetry and light performance became the core production focus.", bodyZh: "将精准对称度与光学表现确立为核心生产方向。" },
    { year: "2010", image: "/products/round-sizes.png", titleEn: "Calibrated sizing", titleZh: "校准尺寸体系", bodyEn: "Standard and custom size references made repeat purchasing more predictable.", bodyZh: "完善常规与定制尺寸参照，让重复补货更加可控。" },
    { year: "2015", image: "/media/dfc-factory-stock.jpeg", titleEn: "Stable inventory", titleZh: "稳定库存供应", bodyEn: "Stock planning and batch organization strengthened dependable wholesale supply.", bodyZh: "通过库存规划与批次管理，提升批发供应稳定性。" },
    { year: "2018", image: "/media/dfc-factory-sorting.jpeg", titleEn: "Production control", titleZh: "强化生产管控", bodyEn: "Sorting, inspection and packing checks became a connected production workflow.", bodyZh: "将分选、检测与包装检查整合为连贯的生产流程。" },
    { year: "2020", image: "/products/round-parcel.png", titleEn: "Wholesale workflow", titleZh: "完善批发流程", bodyEn: "Quantity tiers and clearer order handling improved recurring B2B purchasing.", bodyZh: "通过阶梯报价与清晰订单流程，提升长期 B2B 采购效率。" },
    { year: "2025", image: "/products/round-premium.png", titleEn: "Global catalog launch", titleZh: "全球商品目录上线", bodyEn: "A digital catalog connected products, MOQ, quoting and secure order lookup.", bodyZh: "上线数字化商品目录，打通产品、起订量、报价与订单查询。" },
    { year: "2026", image: "/media/dfc-cz-stock.jpeg", titleEn: "Capacity expansion", titleZh: "产能与库存升级", bodyEn: "Expanded round colorless CZ capacity supports repeat wholesale orders worldwide.", bodyZh: "扩充圆形白色锆石产能与库存，为全球长期批发订单提供支持。" },
  ],
  factoryImages: [
    { src: "/media/dfc-factory-stock.jpeg", en: "Organized stock for stable wholesale supply", zh: "稳定批发供应的分类库存" },
    { src: "/media/dfc-factory-sorting.jpeg", en: "Factory sorting and quality inspection", zh: "工厂分选与品质检查" },
    { src: "/media/dfc-cz-stock.jpeg", en: "Round colorless cubic zirconia inventory", zh: "圆形白色锆石库存" },
    { src: "/media/dfc-hearts-arrows-comparison.png", en: "Round CZ cutting and symmetry comparison", zh: "圆形锆石切工与对称度对比" },
    { src: "/products/round-parcel.png", en: "Colorless batch sorting and packing", zh: "白色锆石批次分选与包装" },
    { src: "/products/round-sizes.png", en: "Calibrated round size reference", zh: "圆形锆石校准尺寸参照" },
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
    { image: "/media/dfc-customer-vietnam.jpeg", quoteEn: "Quality is consistent and communication stays clear from sampling through repeat orders.", quoteZh: "从样品确认到持续补货，品质稳定，沟通也一直清楚顺畅。", nameEn: "Vietnam jewelry partner", nameZh: "越南珠宝合作客户" },
    { image: "/products/round-parcel.png", quoteEn: "Colorless batches match well and the MOQ is practical for mixed-size orders.", quoteZh: "白石批次匹配度好，混合尺寸订单的起订量也合理。", nameEn: "Bangkok accessory factory", nameZh: "曼谷饰品工厂" },
    { image: "/products/round-premium.png", quoteEn: "The team responds quickly when we need custom labels and export documents.", quoteZh: "需要定制标签和出口资料时，团队响应很及时。", nameEn: "Istanbul trading company", nameZh: "伊斯坦布尔贸易公司" },
  ],
};
