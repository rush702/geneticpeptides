import type { MetadataRoute } from "next";
import { vendors } from "@/lib/vendors";

const BASE_URL = "https://pepassure.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/for-vendors",
    "/most-wanted",
    "/peptides",
    "/methodology",
    "/api-docs",
    "/about",
    "/blog",
    "/contact",
    "/nominate",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  // One entry per vendor — surfaces all 250+ vendor pages to Google.
  // Scored vendors get higher priority than pending ones.
  const vendorRoutes: MetadataRoute.Sitemap = vendors.map((v) => ({
    url: `${BASE_URL}/vendors/${v.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: v.pending ? 0.4 : 0.8,
  }));

  return [...staticRoutes, ...vendorRoutes];
}
