import { ImageResponse } from "next/og";

// iOS home-screen icon (180px). iOS ignores the manifest icons and uses this.
// No transparency/rounding — iOS masks the corners itself.
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(150deg, #0e7457, #0a5a44)",
          color: "#fff",
          fontSize: 90,
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
