"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Icon from "./Icon";
import MarkdownContent from "./MarkdownContent";
import QuizEngine from "./QuizEngine";
import { useHeaderSlot } from "./HeaderSlot";
import { loadCertProgress, saveCertProgress } from "@/lib/progress";

export default function ChapterClient({ cert, chapterId, activeChapter }) {
  const [activeTab, setActiveTab] = useState("learn");
  const [navOpen, setNavOpen] = useState(false);
  const [progress, setProgress] = useState({
    completedChapters: [],
    chapterHighScores: {},
    practiceScores: {},
    finalScore: undefined,
  });
  const { setSlot } = useHeaderSlot();

  useEffect(() => {
    setProgress(loadCertProgress(cert.slug));
  }, [cert.slug]);

  // Close the mobile chapter drawer whenever we navigate to a new chapter.
  useEffect(() => {
    setNavOpen(false);
  }, [chapterId]);

  // Inject the Study guide / Practice quiz switcher into the global header,
  // and clear it when leaving the page.
  useEffect(() => {
    setSlot(
      <div className="study-tabs" role="tablist" aria-label="Study mode">
        <button
          className={`study-tab ${activeTab === "learn" ? "active" : ""}`}
          onClick={() => setActiveTab("learn")}
          role="tab"
          aria-selected={activeTab === "learn"}
        >
          <Icon name="book-open" size={16} />
          <span className="study-tab-label">Study guide</span>
        </button>
        <button
          className={`study-tab ${activeTab === "quiz" ? "active" : ""}`}
          onClick={() => setActiveTab("quiz")}
          role="tab"
          aria-selected={activeTab === "quiz"}
        >
          <Icon name="clipboard" size={16} />
          <span className="study-tab-label">Practice quiz</span>
        </button>
      </div>
    );
    return () => setSlot(null);
  }, [activeTab, setSlot]);

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

  return (
    <div className="workspace-container">
      <Sidebar
        cert={cert}
        activeChapterId={chapterId}
        completedChapters={progress.completedChapters}
        highScores={progress.chapterHighScores}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      {/* Backdrop behind the mobile drawer */}
      {navOpen && (
        <div
          className="study-sidebar-backdrop"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="study-main">
        {/* Mobile-only bar to open the chapter drawer */}
        <button
          type="button"
          className="study-nav-toggle"
          onClick={() => setNavOpen(true)}
          aria-label="Open chapter list"
        >
          <Icon name="layers" size={16} />
          Chapters
        </button>

        {/* Scrolling content — tabs live in the global header */}
        <div className="study-body">
          <div className="study-body-inner">
            {activeTab === "learn" ? (
              <div className="learn-panel">
                <MarkdownContent htmlContent={activeChapter.overviewHtml} />

                <div className="completion-card">
                  <div className="completion-card-body">
                    <h4>Finished studying?</h4>
                    <p>
                      Mark this chapter as learned to track your progress, or jump
                      straight into the practice quiz to test yourself.
                    </p>
                    <div className="completion-actions">
                      <label className="checkbox-toggle">
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={(e) => handleMarkAsRead(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">
                          {isCompleted ? "Learned & completed" : "Mark as completed"}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="btn-pill"
                        onClick={() => setActiveTab("quiz")}
                      >
                        Take the quiz
                        <Icon name="arrow" size={16} />
                      </button>
                    </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
