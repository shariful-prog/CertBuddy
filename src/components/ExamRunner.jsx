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
      ? progress?.finalScores?.[examId]
      : progress?.practiceScores?.[examId];

  const handleFinish = (score) => {
    const current = loadCertProgress(cert.slug);
    if (kind === "final") {
      const prevBest = current.finalScores?.[examId] ?? 0;
      saveCertProgress(cert.slug, {
        ...current,
        finalScores: { ...current.finalScores, [examId]: Math.max(prevBest, score) },
      });
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
