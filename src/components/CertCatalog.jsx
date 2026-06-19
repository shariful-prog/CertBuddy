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
      <section className="catalog-hero">
        <div className="catalog-hero-text">
          <p className="eyebrow">Certification study hub</p>
          <h1 className="catalog-title">Study with intent. Pass with confidence.</h1>
          <p className="catalog-lede">
            Work through every section of a certification, check your understanding
            with a quiz after each chapter, then prove you&rsquo;re ready with
            full-length practice and final exams.
          </p>
        </div>
        <dl className="catalog-stats">
          <div className="catalog-stat">
            <dd>{certifications.length}</dd>
            <dt>Certifications</dt>
          </div>
          <div className="catalog-stat">
            <dd>{totalChapters}</dd>
            <dt>Study chapters</dt>
          </div>
          <div className="catalog-stat">
            <dd>{totalExams}</dd>
            <dt>Practice &amp; final exams</dt>
          </div>
        </dl>
      </section>

      <section className="catalog-grid-section">
        <div className="section-head">
          <h2 className="section-head-title">Certifications</h2>
          <span className="section-head-rule" />
          <span className="section-head-meta">{certifications.length} available</span>
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
              <Link key={cert.slug} href={`/exams/${cert.slug}`} className="cert-card">
                <div className="cert-card-top">
                  <span className="cert-code">{cert.code}</span>
                  <span className="cert-tag">{started ? `In progress · ${pct}%` : "Available now"}</span>
                </div>
                <h3 className="cert-card-title">{cert.title}</h3>
                <p className="cert-card-desc">{cert.description}</p>
                <CardFacts cert={cert} />
                <div className="cert-card-foot">
                  <div className="track" aria-hidden="true">
                    <span className="track-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="cert-card-cta">
                    {started ? "Continue" : "Start studying"}
                    <Icon name="arrow" size={16} />
                  </span>
                </div>
              </Link>
            );
          })}

          {UPCOMING.map((cert) => (
            <div key={cert.code} className="cert-card cert-card-upcoming" aria-disabled="true">
              <div className="cert-card-top">
                <span className="cert-code">{cert.code}</span>
                <span className="cert-tag muted">Coming soon</span>
              </div>
              <h3 className="cert-card-title">{cert.title}</h3>
              <p className="cert-card-desc">{cert.description}</p>
              <CardFacts cert={cert} />
              <div className="cert-card-foot">
                <span className="cert-card-cta muted">In development</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
