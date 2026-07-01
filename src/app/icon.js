import { ImageResponse } from "next/og";

// 192px PWA / browser icon rendered at build time — the "CB" monogram on brand green.
export const size = { width: 192, height: 192 };
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
          background: "linear-gradient(150deg, #0e7457, #0a5a44)",
          color: "#fff",
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: "-4px",
          fontFamily: "sans-serif",
        }}
      >
        CB
      </div>
    ),
    { ...size }
  );
}
