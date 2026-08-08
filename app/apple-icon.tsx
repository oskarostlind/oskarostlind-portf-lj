import { ImageResponse } from "next/og";

/** Ikon för hemskärm på iOS. Samma märke som faviconen, mer luft. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#050505",
          color: "#f5f5f0",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -50,
            width: 220,
            height: 220,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(0,229,255,0.30) 0%, rgba(0,229,255,0) 68%)",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 82,
            fontWeight: 600,
            letterSpacing: -5,
            lineHeight: 1,
          }}
        >
          OÖ
        </div>
        <div
          style={{
            marginTop: 14,
            width: 12,
            height: 12,
            borderRadius: 9999,
            background: "#00e5ff",
          }}
        />
      </div>
    ),
    size
  );
}
