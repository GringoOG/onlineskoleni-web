export type CourseColor = "blue" | "red" | "amber" | "green" | "violet" | "teal";

export interface Course {
  slug: string;
  title: string;
  shortTitle: string;
  color: CourseColor;
  description: string;
  highlights: string[];
}

export interface SiteInfo {
  name: string;
  tagline: string;
  company: string;
  ico: string;
  address: {
    street: string;
    city: string;
    zip: string;
  };
  email: string;
  phone: string;
}

export interface PricingPlan {
  catalogSlug?: string;
  name: string;
  description: string;
  price: string;
  per: string;
  features: string[];
}

export interface BulkDiscountTier {
  range: string;
  discount: string;
}

export interface SubstituteFulfillmentContent {
  badge: string;
  title: string;
  summary: string;
  legalBasis: string;
  strip: string;
  whatItMeans: {
    title: string;
    paragraphs: string[];
  };
  howItWorks: {
    title: string;
    items: string[];
  };
  benefits: string[];
  cta: string;
  ctaButton: string;
}

export interface PagesContent {
  site: SiteInfo;
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  substituteFulfillment: SubstituteFulfillmentContent;
  about: { title: string; intro: string; body: string };
  whyUs: { title: string; items: string[] };
  howToOrder: { title: string; steps: string[] };
  pillars: { title: string; description: string }[];
  onlineBenefits: { title: string; items: string[] };
  services: {
    title: string;
    elearning: { title: string; description: string };
    fireSafety: { title: string; description: string };
    legalNote: string;
  };
  demoTest: {
    title: string;
    description: string;
    username: string;
    password: string;
    note: string;
  };
  qrPayment: {
    accountNumber: string;
    bankCode: string;
    accountLabel: string;
    accountHolder: string;
  };
  relatedLinks: { title: string; url: string }[];
  social: { name: string; url: string }[];
}
