"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import MarkdownContent from "./MarkdownContent";
import QuizEngine from "./QuizEngine";
import { loadCertProgress, saveCertProgress } from "@/lib/progress";

export default function ChapterClient({ cert, chapterId, activeChapter }) {
  const [activeTab, setActiveTab] = useState("learn");
  const [progress, setProgress] = useState({
    completedChapters: [],
    chapterHighScores: {},
    practiceScores: {},
    finalScore: undefined,
  });

  useEffect(() => {
    setProgress(loadCertProgress(cert.slug));
  }, [cert.slug]);

  const persist = (updated) => {
    setProgress(updated);
    saveCertProgress(cert.slug, updated);
  };

  const handleMarkAsRead = (isRead) => {
    let completed = [...progress.completedChapters];
    if (isRead) {
      if (!completed.includes(chapterId)) completed.push(chapterId);
    } else {
      completed = completed.filter((id) => id !== chapterId);
    }
    persist({ ...progress, completedChapters: completed });
  };

  const handleQuizFinish = (score) => {
    const currentHigh = progress.chapterHighScores[chapterId] || 0;
    const chapterHighScores = { ...progress.chapterHighScores };
    if (score > currentHigh) chapterHighScores[chapterId] = score;

    let completed = [...progress.completedChapters];
    if (score >= 70 && !completed.includes(chapterId)) completed.push(chapterId);

    persist({ ...progress, completedChapters: completed, chapterHighScores });
  };

  const isCompleted = progress.completedChapters.includes(chapterId);
  const currentHighScore = progress.chapterHighScores[chapterId];
  const estimatedTime = 15;

  return (
    <div className="workspace-container">
      <Sidebar
        cert={cert}
        activeChapterId={chapterId}
        completedChapters={progress.completedChapters}
        highScores={progress.chapterHighScores}
      />

      <div className="study-deck">
        <div className="chapter-header-panel">
          <div className="chapter-header-main">
            <div className="chapter-title-block">
              <div className="breadcrumbs">
                <Link href="/">Certifications</Link> /{" "}
                <Link href={`/exams/${cert.slug}`}>{cert.code}</Link>
              </div>
              <h2 className="active-chapter-title">{activeChapter.title}</h2>
            </div>
            <div className="chapter-header-stats">
              <span className="stat-pill">{activeChapter.questions.length} Questions</span>
              {currentHighScore !== undefined && (
                <span className="stat-pill info">Best Score {currentHighScore}%</span>
              )}
              <span className="stat-pill">{estimatedTime} min read</span>
              {isCompleted && <span className="stat-pill success">Completed</span>}
            </div>
          </div>

        </div>

        <div className="chapter-tabs-bar">
          <div className="tabs-container" role="tablist" aria-label="Study mode">
            <button
              className={`tab-btn ${activeTab === "learn" ? "active" : ""}`}
              onClick={() => setActiveTab("learn")}
              role="tab"
              aria-selected={activeTab === "learn"}
            >
              Study guide
            </button>
            <button
              className={`tab-btn ${activeTab === "quiz" ? "active" : ""}`}
              onClick={() => setActiveTab("quiz")}
              role="tab"
              aria-selected={activeTab === "quiz"}
            >
              Practice quiz
            </button>
          </div>
        </div>

        <div className="tab-viewport">
          <div className="content-layout">
            <main className="content-primary">
              {activeTab === "learn" ? (
                <div className="learn-panel">
                  <MarkdownContent htmlContent={activeChapter.overviewHtml} />

                  <div className="completion-card">
                    <div className="completion-card-body">
                      <h4>Finished Studying?</h4>
                      <p>
                        Mark this chapter as learned to track your progress and update
                        the exam progress index.
                      </p>
                      <label className="checkbox-toggle">
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={(e) => handleMarkAsRead(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">
                          {isCompleted ? "Learned & Completed" : "Mark as Completed"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="quiz-panel">
                  <QuizEngine
                    title={activeChapter.title}
                    questions={activeChapter.questions}
                    onFinish={handleQuizFinish}
                    previousHighScore={currentHighScore}
                  />
                </div>
              )}
            </main>

            <aside className="utility-panel" aria-label="Study utilities">
              <div className="utility-card">
                <span className="utility-label">Reading</span>
                <div className="utility-meter">
                  <span style={{ width: isCompleted ? "100%" : "18%" }} />
                </div>
                <strong>{isCompleted ? "Complete" : "In progress"}</strong>
              </div>
              <Link href={`/exams/${cert.slug}`} className="utility-action">
                ← All sections
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
