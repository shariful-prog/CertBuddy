"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ExamMode from "./ExamMode";
import { loadCertProgress, saveCertProgress } from "@/lib/progress";

/**
 * Client wrapper for practice and final exams.
 * kind: "practice" | "final"; examId required for practice.
 */
export default function ExamRunner({ cert, kind, examId, exam }) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    setProgress(loadCertProgress(cert.slug));
  }, [cert.slug]);

  const previousScore =
    kind === "final"
      ? progress?.finalScore
      : progress?.practiceScores?.[examId];

  const handleFinish = (score) => {
    const current = loadCertProgress(cert.slug);
    if (kind === "final") {
      const best = Math.max(current.finalScore ?? 0, score);
      saveCertProgress(cert.slug, { ...current, finalScore: best });
    } else {
      const prevBest = current.practiceScores[examId] ?? 0;
      saveCertProgress(cert.slug, {
        ...current,
        practiceScores: { ...current.practiceScores, [examId]: Math.max(prevBest, score) },
      });
    }
  };

  return (
    <main className="exam-runner-container">
      <div className="breadcrumbs">
        <Link href="/">Certifications</Link> /{" "}
        <Link href={`/exams/${cert.slug}`}>{cert.code}</Link> /{" "}
        <span>{kind === "final" ? "Final Exam" : "Practice"}</span>
      </div>

      <div className="exam-runner-panel">
        <ExamMode
          title={exam.title}
          questions={exam.questions}
          onFinish={handleFinish}
          previousScore={previousScore}
        />
      </div>
    </main>
  );
}
