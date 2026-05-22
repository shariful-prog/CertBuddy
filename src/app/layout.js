import { Outfit, Inter } from "next/font/google";
import Link from "next/link";
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        <header className="global-header">
          <div className="header-container">
            <Link href="/" className="logo-container">
              <span className="logo-icon">CB</span>
              <span className="logo-text">CertBuddy</span>
            </Link>
            <div className="header-meta">
              <span className="exam-badge">DP-700 Fabric Engineer</span>
            </div>
          </div>
        </header>
        <div className="app-layout">
          {children}
        </div>
      </body>
    </html>
  );
}
