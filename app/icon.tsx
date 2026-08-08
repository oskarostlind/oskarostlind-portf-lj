import { ImageResponse } from "next/og";

/**
 * Favicon, genererad vid bygget — ingen binär i repot.
 * Ordmärket är detsamma som i headern: initialerna plus accentpunkten.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#050505",
          borderRadius: 7,
          color: "#f5f5f0",
          fontFamily: "sans-serif",
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: -1,
        }}
      >
        OÖ
        <div
          style={{
            position: "absolute",
            right: 3,
            bottom: 3,
            width: 5,
            height: 5,
            borderRadius: 9999,
            background: "#00e5ff",
          }}
        />
      </div>
    ),
    size
  );
}
