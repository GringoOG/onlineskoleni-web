import type { CourseColor } from "@/types/content";

export const courseColorClasses: Record<
  CourseColor,
  { bg: string; text: string; border: string; badge: string }
> = {
  blue: {
    bg: "bg-brand-tint",
    text: "text-brand-darker",
    border: "border-[#f0d4b8]",
    badge: "bg-gradient-to-br from-brand-light to-brand-dark text-white",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    badge: "bg-gradient-to-br from-red-500 to-brand-darker text-white",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
    badge: "bg-gradient-to-br from-amber-500 to-brand-dark text-white",
  },
  green: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    badge: "bg-emerald-600 text-white",
  },
};
