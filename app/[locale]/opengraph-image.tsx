import { ImageResponse } from "next/og";

export const alt = "Oskar Östlind — Webbutvecklare";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { locale: string };
}) {
  const sv = params.locale !== "en";
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
            top: -180,
            right: -140,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(0,229,255,0.28) 0%, rgba(0,229,255,0) 68%)",
          }}
        />
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#8a8a85" }}>
          OSKAROSTLIND.SE
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.02, letterSpacing: -3, maxWidth: 880 }}>
            {sv ? "Jag bygger digitala upplevelser som säljer" : "I build digital experiences that sell"}
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#8a8a85" }}>
            {sv
              ? "Hemsidor · Frontend · Backend · CRM"
              : "Websites · Frontend · Backend · CRM"}
          </div>
        </div>
      </div>
    ),
    size
  );
}
