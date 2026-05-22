"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Sidebar({ examId, domains, activeChapterId, completedChapters, highScores }) {
  const [collapsed, setCollapsed] = useState(false);

  const totalChapters = domains.reduce((acc, d) => acc + d.chapters.length, 0);
  const completedCount = completedChapters.length;
  const pct = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--active-sidebar-width",
      collapsed ? "72px" : "var(--sidebar-width)"
    );

    return () => {
      document.documentElement.style.removeProperty("--active-sidebar-width");
    };
  }, [collapsed]);

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-header-copy">
          <p className="sidebar-header-label">Study Guide</p>
          <p className="sidebar-exam-title">{examId.toUpperCase()} - Exam Prep</p>
        </div>
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <div className="sidebar-progress">
        <div className="sidebar-progress-label">
          <span>Progress</span>
          <span className="sidebar-progress-pill">{pct}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Chapter navigation">
        {domains.map((domain) => (
          <div key={domain.id}>
            <p className="sidebar-domain-label">{domain.title}</p>
            {domain.chapters.map((chapter) => {
              const isDone = completedChapters.includes(chapter.id);
              const isActive = chapter.id === activeChapterId;
              const score = highScores[chapter.id];

              return (
                <Link
                  key={chapter.id}
                  href={`/exams/${examId}/${chapter.id}`}
                  className={`sidebar-chapter-link${isActive ? " active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={`sidebar-chapter-check${isDone ? " done" : ""}`}>
                    {isDone ? "✓" : ""}
                  </span>
                  <span className="sidebar-chapter-title">{chapter.title}</span>
                  {score !== undefined && (
                    <span className="sidebar-score-pill">{score}%</span>
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
