"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import MarkdownContent from "./MarkdownContent";
import QuizEngine from "./QuizEngine";

export default function ChapterClient({ examId, chapterId, examTitle, domains, activeChapter }) {
  const [activeTab, setActiveTab] = useState("learn");
  const [progress, setProgress] = useState({
    completedChapters: [],
    highScores: {}
  });

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem("certbuddy_progress");
        if (stored) {
          setProgress(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load progress from localStorage", e);
      }
    });
  }, []);

  const saveProgress = (updatedProgress) => {
    setProgress(updatedProgress);
    try {
      localStorage.setItem("certbuddy_progress", JSON.stringify(updatedProgress));
    } catch (e) {
      console.error("Failed to save progress to localStorage", e);
    }
  };

  const handleMarkAsRead = (isRead) => {
    let completed = [...progress.completedChapters];
    if (isRead) {
      if (!completed.includes(chapterId)) {
        completed.push(chapterId);
      }
    } else {
      completed = completed.filter(id => id !== chapterId);
    }

    saveProgress({
      ...progress,
      completedChapters: completed
    });
  };

  const handleQuizFinish = (score) => {
    const currentHigh = progress.highScores[chapterId] || 0;
    const updatedHighScores = { ...progress.highScores };
    
    if (score > currentHigh) {
      updatedHighScores[chapterId] = score;
    }

    let completed = [...progress.completedChapters];
    if (score >= 70 && !completed.includes(chapterId)) {
      completed.push(chapterId);
    }

    saveProgress({
      completedChapters: completed,
      highScores: updatedHighScores
    });
  };

  const isCompleted = progress.completedChapters.includes(chapterId);
  const currentHighScore = progress.highScores[chapterId];
  const estimatedTime = 15;

  return (
    <div className="workspace-container">
      <Sidebar 
        examId={examId}
        domains={domains}
        activeChapterId={chapterId}
        completedChapters={progress.completedChapters}
        highScores={progress.highScores}
      />

      <div className="study-deck">
        <div className="chapter-header-panel">
          <div className="chapter-header-main">
            <div className="chapter-title-block">
              <div className="breadcrumbs">
                <Link href="/">Exams</Link> / <span>{examId.toUpperCase()}</span>
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

          <div className="tabs-container" role="tablist" aria-label="Study mode">
            <button 
              className={`tab-btn ${activeTab === "learn" ? "active" : ""}`}
              onClick={() => setActiveTab("learn")}
              role="tab"
              aria-selected={activeTab === "learn"}
            >
              Study Guide
            </button>
            <button 
              className={`tab-btn ${activeTab === "quiz" ? "active" : ""}`}
              onClick={() => setActiveTab("quiz")}
              role="tab"
              aria-selected={activeTab === "quiz"}
            >
              Practice Quiz
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
                      <p>Mark this chapter as learned to track your progress and update the exam progress index.</p>
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
                    chapterTitle={activeChapter.title}
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
              <button type="button" className="utility-action">Bookmark lesson</button>
              <button type="button" className="utility-action">Notes</button>
              <button type="button" className="utility-action">Quick navigation</button>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
