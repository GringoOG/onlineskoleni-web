import coursesData from "../../content/courses.json";
import pagesData from "../../content/pages.json";
import pricingData from "../../content/pricing.json";
import type { Course, PagesContent, PricingPlan } from "@/types/content";

export const courses = coursesData as Course[];
export const pages = pagesData as PagesContent;
export const pricing = pricingData as {
  intro: string;
  note: string;
  plans: PricingPlan[];
  bulkDiscount: string;
};

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getCourseSlugs(): string[] {
  return courses.map((c) => c.slug);
}

export const site = pages.site;
export const qrPayment = pages.qrPayment;
