"use client";

import React, { useCallback, useMemo, useState } from "react";
import { normaliseQuestion, FormattedText, ResultsScreen, LETTERS } from "./QuizEngine";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function answersMatch(selected, correctIndices) {
  if (selected === null || selected === undefined) return false;
  const sel = Array.isArray(selected) ? [...selected].sort() : [selected];
  const cor = [...correctIndices].sort();
  return sel.length === cor.length && sel.every((v, i) => v === cor[i]);
}

function ExamStart({ title, total, previousScore, onStart }) {
  return (
    <div className="quiz-start">
      <p className="eyebrow">Exam mode</p>
      <h2 className="quiz-start-title">{title}</h2>
      <p className="quiz-start-lede">
        A full-length set of <strong>{total}</strong> questions. Answer each one,
        then review your results and explanations at the end — just like the real exam.
      </p>
      <dl className="quiz-start-stats">
        <div><dt>Questions</dt><dd>{total}</dd></div>
        <div><dt>Feedback</dt><dd>At the end</dd></div>
        {previousScore !== undefined && (
          <div><dt>Your best</dt><dd>{previousScore}%</dd></div>
        )}
      </dl>
      <button className="btn-primary" onClick={onStart}>
        Start exam
      </button>
    </div>
  );
}

function ExamReview({ questions, answers, onRetry }) {
  return (
    <div className="exam-review">
      <h3 className="exam-review-title">Answer Review</h3>
      {questions.map((q, qi) => {
        const selected = answers[qi];
        const correct = answersMatch(selected, q.correctIndices ?? q.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i !== -1));
        const selectedArr = Array.isArray(selected) ? selected : selected === null || selected === undefined ? [] : [selected];
        return (
          <div key={qi} className={`exam-review-item ${correct ? "correct" : "incorrect"}`}>
            <div className="exam-review-head">
              <span className="exam-review-num">Q{qi + 1}</span>
              <span className={`exam-review-flag ${correct ? "ok" : "bad"}`}>
                {correct ? "✓ Correct" : selectedArr.length === 0 ? "— Skipped" : "✗ Incorrect"}
              </span>
            </div>
            <FormattedText text={q.text} variant="question" />
            <div className="exam-review-options">
              {q.options.map((opt, oi) => {
                const isCorrect = opt.correct;
                const wasPicked = selectedArr.includes(oi);
                let cls = "exam-review-opt";
                if (isCorrect) cls += " correct";
                if (wasPicked && !isCorrect) cls += " incorrect";
                return (
                  <div key={oi} className={cls}>
                    <span className="option-letter">{LETTERS[oi]}</span>
                    <span>{opt.text}</span>
                    {wasPicked && <span className="exam-review-picked">your answer</span>}
                  </div>
                );
              })}
            </div>
            {q.explanation && (
              <div className="explanation-box">
                <div className="explanation-label">Explanation</div>
                <div>{q.explanation}</div>
              </div>
            )}
          </div>
        );
      })}
      <div className="results-actions">
        <button className="btn-primary" onClick={onRetry}>🔄 Retake Exam</button>
      </div>
    </div>
  );
}

export default function ExamMode({ title, questions, onFinish, previousScore }) {
  const [phase, setPhase] = useState("start"); // start | exam | results
  const [examQuestions, setExamQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qIndex]: idx | idx[] }
  const [showReview, setShowReview] = useState(false);

  const prepared = useMemo(
    () =>
      questions.map((q, i) => {
        const n = normaliseQuestion(q, i);
        const correctIndices = n.options.map((o, oi) => (o.correct ? oi : -1)).filter((oi) => oi !== -1);
        return { ...n, correctIndices };
      }),
    [questions]
  );

  const start = useCallback(() => {
    setExamQuestions(shuffle(prepared));
    setIndex(0);
    setAnswers({});
    setShowReview(false);
    setPhase("exam");
  }, [prepared]);

  const correctCount = useMemo(
    () => examQuestions.reduce((acc, q, qi) => (answersMatch(answers[qi], q.correctIndices) ? acc + 1 : acc), 0),
    [examQuestions, answers]
  );

  const select = (optionIndex) => {
    const q = examQuestions[index];
    setAnswers((prev) => {
      if (q.isMulti) {
        const cur = new Set(Array.isArray(prev[index]) ? prev[index] : []);
        cur.has(optionIndex) ? cur.delete(optionIndex) : cur.add(optionIndex);
        return { ...prev, [index]: [...cur] };
      }
      return { ...prev, [index]: optionIndex };
    });
  };

  const finish = useCallback(() => {
    const score = Math.round((correctCount / examQuestions.length) * 100);
    onFinish?.(score);
    setPhase("results");
  }, [correctCount, examQuestions.length, onFinish]);

  if (phase === "start") {
    return (
      <ExamStart
        title={title}
        total={prepared.length}
        previousScore={previousScore}
        onStart={start}
      />
    );
  }

  if (phase === "results") {
    const score = Math.round((correctCount / examQuestions.length) * 100);
    if (showReview) {
      return <ExamReview questions={examQuestions} answers={answers} onRetry={start} />;
    }
    return (
      <div>
        <ResultsScreen
          score={score}
          total={examQuestions.length}
          correct={correctCount}
          onRetry={start}
          onBack={() => setShowReview(true)}
        />
        <div className="results-actions" style={{ marginTop: "calc(-1 * var(--space-4))" }}>
          <button className="btn-secondary" onClick={() => setShowReview(true)}>
            📋 Review Answers
          </button>
        </div>
      </div>
    );
  }

  // Exam phase
  const q = examQuestions[index];
  const selected = answers[index];
  const selectedArr = Array.isArray(selected) ? selected : selected === null || selected === undefined ? [] : [selected];
  const isLast = index === examQuestions.length - 1;
  const answeredCount = Object.keys(answers).filter((k) => {
    const v = answers[k];
    return Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined;
  }).length;

  return (
    <div className="question-card">
      <div className="quiz-progress-header" style={{ padding: "var(--space-4) var(--space-5) 0" }}>
        <div className="quiz-progress-meta">
          <span className="quiz-progress-label">Question {index + 1} of {examQuestions.length}</span>
          <span className="quiz-score-live">📝 {answeredCount} answered</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${((index + 1) / examQuestions.length) * 100}%` }} />
        </div>
      </div>

      <div className="question-card-header">
        <span className="question-type-tag">{q.isMulti ? "Multiple Select" : "Single Answer"}</span>
        <FormattedText text={q.text} variant="question" />
      </div>

      {q.isMulti && <div className="multiselect-note">⚠️ Select all answers that apply.</div>}

      <div className="options-list">
        {q.options.map((option, i) => (
          <button
            key={i}
            className={`option-btn ${selectedArr.includes(i) ? "selected" : ""}`}
            onClick={() => select(i)}
          >
            <span className="option-letter">{LETTERS[i]}</span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>

      <div className="question-actions">
        <button
          className="btn-secondary"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          ← Previous
        </button>
        {isLast ? (
          <button className="btn-primary" onClick={finish}>
            Finish Exam 🏆
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setIndex((i) => i + 1)}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
