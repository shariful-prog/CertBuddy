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
  // First domain expanded by default; others collapsed.
  const [openDomains, setOpenDomains] = useState(() => ({ 0: true }));

  useEffect(() => {
    setProgress(loadCertProgress(cert.slug));
  }, [cert.slug]);

  const finalExams =
    Array.isArray(cert.finalExams) && cert.finalExams.length
      ? cert.finalExams
      : cert.finalExam
      ? [cert.finalExam]
      : [];

  const totalChapters = cert.domains.reduce((a, d) => a + d.chapters.length, 0);
  const completed = progress.completedChapters.length;
  const pct = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0;

  const toggleDomain = (i) =>
    setOpenDomains((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <main className="landing">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Certifications</Link>
        <span className="crumbs-sep">
          <Icon name="arrow" size={13} />
        </span>
        <span aria-current="page">{cert.code}</span>
      </nav>

      {/* ── Header card ── */}
      <header className="cert-head-card">
        <div className="cert-head-main">
          <h1 className="cert-head-title">{cert.title}</h1>
          <p className="cert-head-fulltitle">{cert.fullTitle}</p>
        </div>
        <span className={`hpill hpill-progress ${pct === 100 ? "is-complete" : ""}`}>
          <Icon name={pct === 100 ? "trophy" : "target"} size={13} />
          {completed}/{totalChapters} done · {pct}%
        </span>
      </header>

      {/* ── Study guide ── */}
      <section className="landing-section">
        <div className="section-head section-head-spread">
          <h2 className="section-head-title">Study guide</h2>
          <div className="section-head-facts">
            <span><Icon name="layers" size={15} /> {cert.domains.length} domains</span>
            <span><Icon name="book" size={15} /> {totalChapters} chapters</span>
          </div>
        </div>

        <div className="domain-accordion">
          {cert.domains.map((domain, di) => {
            const open = !!openDomains[di];
            const domainDone = domain.chapters.filter((c) =>
              progress.completedChapters.includes(c.id)
            ).length;
            return (
              <div key={domain.id} className={`domain-panel ${open ? "open" : ""}`}>
                <button
                  type="button"
                  className="domain-bar"
                  aria-expanded={open}
                  onClick={() => toggleDomain(di)}
                >
                  <span className="domain-badge">{pad2(di + 1)}</span>
                  <span className="domain-bar-title">{domain.title}</span>
                  <span className="domain-bar-meta">
                    {domainDone > 0 && (
                      <span className="domain-bar-progress">{domainDone}/{domain.chapters.length}</span>
                    )}
                    <span className="domain-chip">{domain.chapters.length} chapters</span>
                    <Icon name="chevron" size={18} className="domain-chevron" />
                  </span>
                </button>

                {open && (
                  <div className="domain-chapters">
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
                            {isDone ? <Icon name="check" size={14} strokeWidth={2.5} /> : <span className="chapter-dot" />}
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
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Practice exams ── */}
      {cert.practiceExams.length > 0 && (
        <section className="landing-section">
          <div className="section-head section-head-spread">
            <h2 className="section-head-title">Practice exams</h2>
            <span className="section-head-meta">{cert.practiceExams.length} sets</span>
          </div>
          <p className="section-sub">
            Full-length sets that mimic the real exam. Answers and explanations
            appear after you finish.
          </p>

          <div className="exam-grid">
            {cert.practiceExams.map((exam, ei) => {
              const score = progress.practiceScores[exam.id];
              const attempted = score !== undefined;
              const passed = attempted && score >= 70;
              return (
                <Link
                  key={exam.id}
                  href={`/exams/${cert.slug}/practice/${exam.id}`}
                  className={`exam-tile ${attempted ? "is-attempted" : ""}`}
                >
                  <span className="exam-tile-icon">
                    <Icon name="clipboard" size={20} />
                    <span className="exam-tile-num">{pad2(ei + 1)}</span>
                  </span>
                  <span className="exam-tile-body">
                    <span className="exam-tile-name">{exam.title}</span>
                    <span className="exam-tile-meta">
                      <span className="exam-tile-count">{exam.questions.length} questions</span>
                      <span
                        className={`exam-tile-status ${
                          attempted ? (passed ? "pass" : "retry") : "new"
                        }`}
                      >
                        {attempted ? (passed ? "Passed" : "Keep going") : "Not started"}
                      </span>
                    </span>
                    {attempted && (
                      <span className="exam-tile-bar" aria-hidden="true">
                        <span
                          className={`exam-tile-bar-fill ${passed ? "pass" : ""}`}
                          style={{ width: `${score}%` }}
                        />
                      </span>
                    )}
                  </span>
                  <span className="exam-tile-end">
                    {attempted ? (
                      <span className={`exam-tile-score ${passed ? "pass" : ""}`}>{score}%</span>
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

      {/* ── Final exams ── */}
      {finalExams.length > 0 && (
        <section className="landing-section">
          <div className="section-head section-head-spread">
            <h2 className="section-head-title">
              {finalExams.length > 1 ? "Final exams" : "Final exam"}
            </h2>
          </div>

          <div className="final-list">
            {finalExams.map((exam) => {
              const best = progress.finalScores?.[exam.id];
              return (
                <Link
                  key={exam.id}
                  href={`/exams/${cert.slug}/final/${exam.id}`}
                  className="final-banner"
                >
                  <span className="final-icon"><Icon name="flag" size={20} /></span>
                  <span className="final-copy">
                    <span className="final-name">{exam.title}</span>
                    <span className="final-desc">
                      {exam.questions.length} questions · full certification
                    </span>
                  </span>
                  <span className="final-cta">
                    <span className="final-cta-label">
                      {best !== undefined ? `Best ${best}% · Retake` : "Start"}
                    </span>
                    <Icon name="arrow" size={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
