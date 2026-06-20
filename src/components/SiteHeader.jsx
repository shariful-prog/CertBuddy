"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useHeaderSlot } from "./HeaderSlot";

export default function SiteHeader() {
  const { slot } = useHeaderSlot();
  const pathname = usePathname() || "";
  // On study pages the tabs fill the center — never render the marketing nav
  // there, so it can't flash before the slot is injected on hydration.
  const isStudyPage = /\/exams\/[^/]+\/study\//.test(pathname);
  const isHome = pathname === "/";
  const isDp700 = pathname.startsWith("/exams/dp-700");

  return (
    <header className="global-header">
      <div className="header-container">
        <Link href="/" className="logo-container">
          <span className="logo-icon">CB</span>
          <span className="logo-text">CertBuddy</span>
        </Link>

        {slot ? (
          <div className="header-slot">{slot}</div>
        ) : isStudyPage ? null : (
          <nav className="header-meta primary-nav" aria-label="Primary">
            <Link href="/" className={`nav-link${isHome ? " nav-link-active" : ""}`}>Home</Link>
            <Link href="/#certifications" className="nav-link">Certifications</Link>
            <Link href="/exams/dp-700" className={`nav-link${isDp700 ? " nav-link-active" : ""}`}>DP-700</Link>
          </nav>
        )}

        <div className="header-meta header-actions">
          <Link href="/" className="btn-ghost">
            <Icon name="clipboard" size={16} />
            Certifications
          </Link>
          <Link href="/exams/dp-700" className="btn-pill">
            Start studying
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
