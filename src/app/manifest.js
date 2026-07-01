// PWA web app manifest (App Router file convention → served at /manifest.webmanifest).
// NOTE: this is the *PWA* manifest. The list of certifications lives in src/manifest.js.
export default function manifest() {
  return {
    name: "CertBuddy — Microsoft Certification Exam Prep",
    short_name: "CertBuddy",
    description:
      "Study guides and interactive practice exams for DP-700 and other Microsoft Fabric certifications.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0e7457",
    categories: ["education", "productivity"],
    icons: [
      // Generated at build time by app/icon.js (192px) and app/icon1.js (512px).
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/icon1", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
