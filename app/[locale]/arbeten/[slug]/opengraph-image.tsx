import { ImageResponse } from "next/og";
import { getProject, allProjects } from "@/lib/projects";
import { routing } from "@/i18n/routing";

export const alt = "Case";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    allProjects.map((p) => ({ locale, slug: p.slug }))
  );
}

export default async function Image({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const project = getProject(params.slug);
  const l = params.locale === "en" ? "en" : "sv";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050505",
          padding: 72,
          color: "#f5f5f0",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: -220,
            left: -120,
            width: 640,
            height: 640,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(0,229,255,0.24) 0%, rgba(0,229,255,0) 68%)",
          }}
        />
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#8a8a85" }}>
          {l === "sv" ? "CASE — OSKAR ÖSTLIND" : "CASE — OSKAR ÖSTLIND"}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, lineHeight: 1.04, letterSpacing: -2 }}>
            {project?.title ?? "Case"}
          </div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#8a8a85", maxWidth: 940 }}>
            {project?.tagline[l] ?? ""}
          </div>
          <div style={{ marginTop: 32, display: "flex", gap: 18, fontSize: 20, color: "#56564f" }}>
            {(project?.stack ?? []).slice(0, 5).map((s) => (
              <div key={s} style={{ display: "flex" }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
