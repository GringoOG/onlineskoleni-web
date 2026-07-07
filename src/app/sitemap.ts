import type { MetadataRoute } from "next";
import { getCourseSlugs } from "@/lib/content";

const baseUrl = "https://www.onlineskoleni.eu";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/skoleni",
    "/sluzby",
    "/cenik",
    "/objednavka",
    "/kontakt",
    "/ochrana-udaju",
    "/obchodni-podminky",
  ];
  const courseRoutes = getCourseSlugs().map((slug) => `/skoleni/${slug}`);

  return [...staticRoutes, ...courseRoutes].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/skoleni/") ? 0.8 : 0.7,
  }));
}
