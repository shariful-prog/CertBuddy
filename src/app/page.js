"use client";

import React, { useEffect, useState } from "react";
import { examData } from "@/data";

export default function Home() {
  const [progress, setProgress] = useState({
    completedChapters: [],
    highScores: {}
  });

  // Load study progress from localStorage on client-side
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

  const totalChapters = examData.domains.reduce(
    (acc, domain) => acc + domain.chapters.length,
    0
  );
  
  const completedCount = progress.completedChapters.length;
  const completionPercentage = totalChapters > 0 
    ? Math.round((completedCount / totalChapters) * 100) 
    : 0;

  // Calculate average quiz score
  const quizScores = Object.values(progress.highScores);
  const averageScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
    : 0;

  return (
    <main className="homepage-container">
      <div className="hero-section">
        <h1>Prepare Smarter for Microsoft Certifications</h1>
        <p className="hero-subtitle">
          High-quality study guides and mock practice exams in a focused, minimalist interface.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📈</span>
          <div className="stat-info">
            <h3>Overall Progress</h3>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${completionPercentage}%` }}></div>
            </div>
            <p className="stat-subtext">{completedCount} of {totalChapters} chapters completed ({completionPercentage}%)</p>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <div className="stat-info">
            <h3>Quiz Average Score</h3>
            <p className="stat-main">{quizScores.length > 0 ? `${averageScore}%` : "No quizzes taken"}</p>
            <p className="stat-subtext">Based on {quizScores.length} practice sessions</p>
          </div>
        </div>
      </div>

      {/* Active Exam Section */}
      <div className="exam-card">
        <div className="exam-card-header">
          <span className="exam-status-tag">Active Study Guide</span>
          <h2>{examData.title}</h2>
          <p className="exam-description">
            Focuses on designing, implementing, and optimizing data integration solutions using Microsoft Fabric lakehouses, notebooks, pipelines, and Spark compute engines.
          </p>
        </div>

        {examData.domains.map((domain) => (
          <div key={domain.id} className="domain-section">
            <h3 className="domain-title">
              <span className="domain-bullet">📂</span>
              {domain.title}
            </h3>
            
            <div className="chapter-grid">
              {domain.chapters.map((chapter) => {
                const isCompleted = progress.completedChapters.includes(chapter.id);
                const highScore = progress.highScores[chapter.id];
                
                return (
                  <a 
                    key={chapter.id} 
                    href={`/exams/${examData.id}/${chapter.id}`}
                    className={`chapter-card ${isCompleted ? "completed" : ""}`}
                  >
                    <div className="chapter-card-body">
                      <div className="chapter-meta-top">
                        <span className="question-count-badge">
                          📝 {chapter.questions.length} Questions
                        </span>
                        {isCompleted && (
                          <span className="completed-badge">✓ Learned</span>
                        )}
                      </div>
                      
                      <h4 className="chapter-title-text">{chapter.title}</h4>
                      
                      <div className="chapter-card-footer">
                        {highScore !== undefined ? (
                          <span className="score-badge">
                            High Score: <strong>{highScore}%</strong>
                          </span>
                        ) : (
                          <span className="start-prompt">Start Studying →</span>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
