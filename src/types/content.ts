export type CourseColor = "blue" | "red" | "amber" | "green" | "violet";

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
  name: string;
  description: string;
  priceFrom: string;
  per: string;
  features: string[];
}

export interface PagesContent {
  site: SiteInfo;
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
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
  relatedLinks: { title: string; url: string }[];
  social: { name: string; url: string }[];
}
