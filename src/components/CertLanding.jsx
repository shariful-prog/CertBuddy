"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import { loadCertProgress } from "@/lib/progress";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export default function CertLanding({ cert }) {
  const [progress, setProgress] = useState({
    completedChapters: [],
    chapterHighScores: {},
    practiceScores: {},
    finalScore: undefined,
  });

  useEffect(() => {
    setProgress(loadCertProgress(cert.slug));
  }, [cert.slug]);

  const totalChapters = cert.domains.reduce((a, d) => a + d.chapters.length, 0);
  const completed = progress.completedChapters.length;
  const pct = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0;

  return (
    <main className="landing">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Certifications</Link>
        <span className="crumbs-sep">/</span>
        <span aria-current="page">{cert.code}</span>
      </nav>

      <header className="landing-hero">
        <div className="landing-hero-main">
          <span className="cert-code">{cert.code}</span>
          <h1 className="landing-title">{cert.title}</h1>
          <p className="landing-fulltitle">{cert.fullTitle}</p>
          <p className="landing-lede">{cert.description}</p>
        </div>

        <aside className="landing-progress-card" aria-label="Your progress">
          <div className="ring" style={{ "--pct": pct }}>
            <span className="ring-num">{pct}<small>%</small></span>
          </div>
          <p className="landing-progress-text">
            <strong>{completed}</strong> of {totalChapters} chapters completed
          </p>
        </aside>
      </header>

      {/* Study domains */}
      <section className="landing-section">
        <div className="section-head">
          <h2 className="section-head-title">Study guide</h2>
          <span className="section-head-rule" />
          <span className="section-head-meta">{cert.domains.length} domains</span>
        </div>

        <div className="domains">
          {cert.domains.map((domain, di) => (
            <div key={domain.id} className="domain">
              <div className="domain-head">
                <span className="domain-num">{pad2(di + 1)}</span>
                <h3 className="domain-name">{domain.title}</h3>
                <span className="domain-count">{domain.chapters.length} chapters</span>
              </div>

              <div className="chapter-list">
                {domain.chapters.map((chapter, ci) => {
                  const isDone = progress.completedChapters.includes(chapter.id);
                  const high = progress.chapterHighScores[chapter.id];
                  return (
                    <Link
                      key={chapter.id}
                      href={`/exams/${cert.slug}/study/${chapter.id}`}
                      className={`chapter-row ${isDone ? "done" : ""}`}
                    >
                      <span className="chapter-check" aria-hidden="true">
                        {isDone ? <Icon name="check" size={14} strokeWidth={2.5} /> : pad2(ci + 1)}
                      </span>
                      <span className="chapter-name">{chapter.title}</span>
                      <span className="chapter-meta">
                        {high !== undefined && <span className="chapter-score">{high}%</span>}
                        <span className="chapter-qs">{chapter.questions.length} Q</span>
                        <Icon name="arrow" size={15} className="chapter-arrow" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Practice exams */}
      {cert.practiceExams.length > 0 && (
        <section className="landing-section">
          <div className="section-head">
            <h2 className="section-head-title">Practice exams</h2>
            <span className="section-head-rule" />
            <span className="section-head-meta">{cert.practiceExams.length} sets</span>
          </div>
          <p className="section-sub">
            Full-length sets that mimic the real exam. Answers and explanations
            appear after you finish.
          </p>

          <div className="exam-grid">
            {cert.practiceExams.map((exam) => {
              const score = progress.practiceScores[exam.id];
              return (
                <Link
                  key={exam.id}
                  href={`/exams/${cert.slug}/practice/${exam.id}`}
                  className="exam-tile"
                >
                  <span className="exam-tile-icon"><Icon name="clipboard" size={20} /></span>
                  <span className="exam-tile-body">
                    <span className="exam-tile-name">{exam.title}</span>
                    <span className="exam-tile-meta">{exam.questions.length} questions</span>
                  </span>
                  <span className="exam-tile-end">
                    {score !== undefined ? (
                      <span className="exam-tile-score">{score}%</span>
                    ) : (
                      <Icon name="arrow" size={16} className="chapter-arrow" />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Final exam */}
      {cert.finalExam && (
        <section className="landing-section">
          <div className="section-head">
            <h2 className="section-head-title">Final exam</h2>
            <span className="section-head-rule" />
          </div>

          <Link href={`/exams/${cert.slug}/final`} className="final-banner">
            <span className="final-icon"><Icon name="flag" size={24} /></span>
            <span className="final-copy">
              <span className="final-name">{cert.finalExam.title}</span>
              <span className="final-desc">
                {cert.finalExam.questions.length} questions across the full
                certification. Take it when you&rsquo;re ready to gauge exam readiness.
              </span>
            </span>
            <span className="final-cta">
              {progress.finalScore !== undefined
                ? `Best ${progress.finalScore}% · Retake`
                : "Start"}
              <Icon name="arrow" size={16} />
            </span>
          </Link>
        </section>
      )}
    </main>
  );
}
