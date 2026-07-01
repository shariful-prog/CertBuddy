"use client";

import React from "react";
import Link from "next/link";
import Icon from "./Icon";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export default function Sidebar({ cert, activeChapterId, completedChapters, highScores, open = false, onClose }) {
  const { slug: examId, code, title, domains } = cert;
  const totalChapters = domains.reduce((acc, d) => acc + d.chapters.length, 0);
  const completedCount = completedChapters.length;
  const pct = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  return (
    <aside className={`study-sidebar${open ? " open" : ""}`} aria-label="Chapter navigation">
      <div className="study-sidebar-head">
        <button
          type="button"
          className="study-sidebar-close"
          onClick={onClose}
          aria-label="Close chapter list"
        >
          <Icon name="arrow" size={18} />
        </button>
        <Link href={`/exams/${examId}`} className="study-sidebar-back">
          <span className="study-sidebar-eyebrow">
            <Icon name="arrow" size={12} className="study-sidebar-back-icon" />
            {code} · Study guide
          </span>
          <span className="study-sidebar-title">{title}</span>
        </Link>
        <div className="study-sidebar-progress">
          <div className="study-sidebar-progress-top">
            <span className="study-sidebar-progress-count">
              <strong>{completedCount}</strong>
              <span className="study-sidebar-progress-total">/ {totalChapters} chapters</span>
            </span>
            <span className="study-sidebar-progress-pct">{pct}%</span>
          </div>
          <div className="track" aria-hidden="true">
            <span className="track-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <nav className="study-sidebar-nav">
        {domains.map((domain, di) => (
          <div key={domain.id} className="study-nav-group">
            <p className="study-nav-domain">
              <span className="study-nav-domain-num">{pad2(di + 1)}</span>
              {domain.title}
            </p>
            {domain.chapters.map((chapter) => {
              const isDone = completedChapters.includes(chapter.id);
              const isActive = chapter.id === activeChapterId;
              const score = highScores[chapter.id];

              return (
                <Link
                  key={chapter.id}
                  href={`/exams/${examId}/study/${chapter.id}`}
                  className={`study-nav-link${isActive ? " active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={`study-nav-check${isDone ? " done" : ""}`}>
                    {isDone && <Icon name="check" size={12} strokeWidth={3} />}
                  </span>
                  <span className="study-nav-label">{chapter.title}</span>
                  {score !== undefined && (
                    <span className="study-nav-score">{score}%</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
