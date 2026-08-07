import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { allProjects } from "@/lib/projects";

const pages: [string, string][] = [
  ["", ""],
  ["/arbeten", "/en/work"],
  ["/tjanster", "/en/services"],
  ["/om", "/en/about"],
  ["/kontakt", "/en/contact"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = pages.map(([sv, en]) => ({
    url: `${site.url}${sv}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: sv === "" ? 1 : 0.8,
    alternates: { languages: { sv: `${site.url}${sv}`, en: `${site.url}${en || "/en"}` } },
  }));

  const caseEntries = allProjects.map((p) => ({
    url: `${site.url}/arbeten/${p.slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        sv: `${site.url}/arbeten/${p.slug}`,
        en: `${site.url}/en/work/${p.slug}`,
      },
    },
  }));

  return [...staticEntries, ...caseEntries];
}
