import { Outfit, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { HeaderSlotProvider } from "@/components/HeaderSlot";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "CertBuddy - Microsoft Certification Exam Prep",
  description: "Prepare for your DP-700 and other Microsoft Fabric certifications with high-fidelity study guides and interactive practice quizzes.",
  appleWebApp: {
    capable: true,
    title: "CertBuddy",
    statusBarStyle: "default",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e7457",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        <ServiceWorkerRegistrar />
        <HeaderSlotProvider>
          <SiteHeader />
          <div className="app-layout">
            {children}
          </div>
          <SiteFooter />
        </HeaderSlotProvider>
        <Analytics />
      </body>
    </html>
  );
}
