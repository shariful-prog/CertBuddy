import { ImageResponse } from "next/og";

// 512px icon (install prompt + maskable). Padding keeps the monogram inside the
// safe zone when Android applies a maskable crop.
export const size = { width: 512, height: 512 };
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
          fontSize: 240,
          fontWeight: 700,
          letterSpacing: "-10px",
          fontFamily: "sans-serif",
        }}
      >
        CB
      </div>
    ),
    { ...size }
  );
}
