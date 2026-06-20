"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import { loadAllProgress } from "@/lib/progress";

// Placeholder certifications shown as "coming soon" (non-clickable).
const UPCOMING = [
  {
    code: "DP-600",
    title: "Fabric Analytics Engineer Associate",
    description:
      "Design and build scalable analytics solutions with semantic models, DAX, and Power BI on Microsoft Fabric.",
    domainCount: 4,
    chapterCount: 18,
    practiceCount: 4,
  },
  {
    code: "AZ-305",
    title: "Azure Solutions Architect Expert",
    description:
      "Architect identity, governance, compute, storage, and networking solutions across Microsoft Azure.",
    domainCount: 5,
    chapterCount: 24,
    practiceCount: 6,
  },
];

function CardFacts({ cert }) {
  return (
    <ul className="cert-facts">
      <li><Icon name="layers" size={15} /> {cert.domainCount} domains</li>
      <li><Icon name="book" size={15} /> {cert.chapterCount} chapters</li>
      <li><Icon name="clipboard" size={15} /> {cert.practiceCount} practice exams</li>
      <li><Icon name="flag" size={15} /> Final exam</li>
    </ul>
  );
}

export default function CertCatalog({ certifications }) {
  const [allProgress, setAllProgress] = useState({});

  useEffect(() => {
    setAllProgress(loadAllProgress());
  }, []);

  const totalChapters = certifications.reduce((a, c) => a + c.chapterCount, 0);
  const totalExams = certifications.reduce(
    (a, c) => a + c.practiceCount + (c.hasFinalExam ? 1 : 0),
    0
  );

  return (
    <main className="catalog">
      {/* ── Hero (compact) ── */}
      <section className="hero">
        <p className="eyebrow">Certification study hub</p>
        <h1 className="hero-title">
          Study with intent. Pass with{" "}
          <span className="hero-title-accent">confidence.</span>
        </h1>
        <p className="hero-lede">
          Work through every section, quiz yourself after each chapter, then prove
          you&rsquo;re ready with full-length practice and final exams.
        </p>

        <div className="hero-row">
          <div className="hero-actions">
            <Link href="#certifications" className="btn-pill">
              Explore certifications
              <Icon name="arrow" size={16} />
            </Link>
            <Link href="/exams/dp-700" className="btn-outline">
              <Icon name="calendar" size={16} />
              View study plan
            </Link>
          </div>

          {/* Inline stat chips — replaces the old full-height stats bar */}
          <ul className="hero-stats">
            <li><Icon name="layers" size={15} /> <strong>{certifications.length}</strong> {certifications.length === 1 ? "cert" : "certs"}</li>
            <li><Icon name="book-open" size={15} /> <strong>{totalChapters}</strong> chapters</li>
            <li><Icon name="trophy" size={15} /> <strong>{totalExams}</strong> exams</li>
          </ul>
        </div>
      </section>

      {/* ── Certifications ── */}
      <section className="catalog-grid-section" id="certifications">
        <div className="section-head section-head-spread">
          <div>
            <h2 className="section-head-title">Certifications</h2>
            <p className="section-head-sub">Choose a certification path and start your journey</p>
          </div>
          <Link href="#certifications" className="section-head-link">
            View all certifications
            <Icon name="arrow" size={15} />
          </Link>
        </div>

        <div className="cert-grid">
          {certifications.map((cert) => {
            const progress = allProgress[cert.slug];
            const completed = progress?.completedChapters?.length || 0;
            const pct =
              cert.chapterCount > 0
                ? Math.round((completed / cert.chapterCount) * 100)
                : 0;
            const started = completed > 0;

            return (
              <article key={cert.slug} className="cert-card">
                <div className="cert-card-top">
                  <span className="cert-code">{cert.code}</span>
                  <span className="cert-status cert-status-live">
                    <span className="cert-status-dot" />
                    {started ? `In progress · ${pct}%` : "Available now"}
                  </span>
                  <button type="button" className="cert-bookmark" aria-label="Bookmark certification">
                    <Icon name="bookmark" size={18} />
                  </button>
                </div>
                <h3 className="cert-card-title">{cert.title}</h3>
                <p className="cert-card-desc">{cert.description}</p>
                <div className="cert-card-foot">
                  <CardFacts cert={cert} />
                  <div className="cert-card-action">
                    {started && (
                      <div className="track" aria-hidden="true">
                        <span className="track-fill" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                    <Link href={`/exams/${cert.slug}`} className="btn-pill cert-card-btn">
                      {started ? "Continue" : "Start learning"}
                      <Icon name="arrow" size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {UPCOMING.map((cert) => (
            <article key={cert.code} className="cert-card cert-card-upcoming" aria-disabled="true">
              <div className="cert-card-top">
                <span className="cert-code">{cert.code}</span>
                <span className="cert-status cert-status-soon">
                  <Icon name="clock" size={13} />
                  Coming soon
                </span>
                <button type="button" className="cert-bookmark" aria-label="Bookmark certification" disabled>
                  <Icon name="bookmark" size={18} />
                </button>
              </div>
              <h3 className="cert-card-title">{cert.title}</h3>
              <p className="cert-card-desc">{cert.description}</p>
              <div className="cert-card-foot">
                <CardFacts cert={cert} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
