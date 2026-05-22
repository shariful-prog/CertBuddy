"use client";

import React, { useState, useCallback, useMemo } from "react";

/* ─── Helpers ──────────────────────────────────────────────── */
const LETTERS = ["A", "B", "C", "D", "E", "F"];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Normalise a raw question from the JSON into a consistent shape. */
function normaliseQuestion(q) {
  // Determine correct answer indices and whether multi-select
  // JSON shape: { type, question, options: [{ text, correct, explanation? }] }
  // or older shape: { question, options: [...], answer, explanation }
  const rawOptions = Array.isArray(q.options)
    ? q.options
    : q.options && typeof q.options === "object"
      ? Object.entries(q.options).map(([key, value]) => ({
          key,
          text: value,
        }))
      : [];

  const options = rawOptions.map((opt, i) => {
    if (typeof opt === "string") {
      return { text: opt, correct: false, explanation: "" };
    }
    return {
      text: opt.text || opt.option || opt,
      correct:
        !!opt.correct ||
        !!opt.isCorrect ||
        String(opt.key || "").toUpperCase() === String(q.answer || "").toUpperCase(),
      explanation: opt.explanation || "",
    };
  });

  // Support legacy "answer" field (0-indexed or letter)
  if (!options.some((o) => o.correct) && q.answer !== undefined) {
    const idx =
      typeof q.answer === "number"
        ? q.answer
        : LETTERS.indexOf(String(q.answer).toUpperCase());
    if (idx >= 0 && idx < options.length) options[idx].correct = true;
  }

  const correctCount = options.filter((o) => o.correct).length;
  const isMulti = correctCount > 1 || q.type === "multiple-select";

  return {
    id: q.id || Math.random().toString(36).slice(2),
    text: q.question || q.text || "",
    options,
    isMulti,
    explanation: q.explanation || options.find((o) => o.correct)?.explanation || "",
    type: q.type || (isMulti ? "multiple-select" : "single-select"),
  };
}

/* ─── Sub-components ───────────────────────────────────────── */

function isCodeLikeText(text) {
  return /(\bspark\.|\bdf\s*=|\bSELECT\b|\bCREATE\b|\bVACUUM\b|\.write|\.read|\.option\(|=>|==|;)/i.test(text);
}

function FormattedText({ text, variant }) {
  const tokens = [];
  const source = String(text || "").replace(/\r\n/g, "\n");
  const fencePattern = /```[^\n]*\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = fencePattern.exec(source)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: source.slice(lastIndex, match.index) });
    }
    tokens.push({ type: "code", value: match[1].trim() });
    lastIndex = fencePattern.lastIndex;
  }

  if (lastIndex < source.length) {
    tokens.push({ type: "text", value: source.slice(lastIndex) });
  }

  const blocks = tokens.flatMap((token) => {
    if (token.type === "code") {
      return token.value ? [token] : [];
    }

    return token.value
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => ({ type: "text", value: block }));
  });

  return (
    <div className={`formatted-text ${variant ? `formatted-text-${variant}` : ""}`}>
      {blocks.map((block, blockIndex) => {
        if (block.type === "code") {
          return <pre key={blockIndex}>{block.value}</pre>;
        }

        const lines = block.value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        const firstNumberedLine = lines.findIndex((line) => /^\d+\.\s+/.test(line));

        if (firstNumberedLine !== -1) {
          const leadLines = lines.slice(0, firstNumberedLine);
          const items = lines
            .slice(firstNumberedLine)
            .filter((line) => /^\d+\.\s+/.test(line))
            .map((line) => line.replace(/^\d+\.\s+/, ""));

          return (
            <div className="formatted-list-block" key={blockIndex}>
              {leadLines.length > 0 && (
                <p className="formatted-list-label">{leadLines.join(" ")}</p>
              )}
              <ol>
                {items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ol>
            </div>
          );
        }

        if (isCodeLikeText(block.value)) {
          return <pre key={blockIndex}>{block.value}</pre>;
        }

        return <p key={blockIndex}>{lines.join(" ")}</p>;
      })}
    </div>
  );
}

function StartScreen({ chapterTitle, totalQuestions, previousHighScore, onStart }) {
  return (
    <div className="quiz-start-screen">
      <span className="quiz-start-icon">📝</span>
      <h2>Practice Quiz</h2>
      <p>
        Test your knowledge of <strong>{chapterTitle}</strong> with{" "}
        {totalQuestions} carefully crafted questions. Instant feedback is shown
        after each answer.
      </p>

      <div className="quiz-meta-pills">
        <span className="quiz-meta-pill">🎯 {totalQuestions} Questions</span>
        <span className="quiz-meta-pill">⚡ Instant Feedback</span>
        <span className="quiz-meta-pill">💾 Progress Saved</span>
        {previousHighScore !== undefined && (
          <span className="quiz-best-score">
            🏆 Best: {previousHighScore}%
          </span>
        )}
      </div>

      <button id="start-quiz-btn" className="btn-primary" onClick={onStart}>
        Start Quiz →
      </button>
    </div>
  );
}

function ResultsScreen({ score, total, correct, onRetry, onBack }) {
  const pct = Math.round((correct / total) * 100);
  const passed = pct >= 70;

  const message = pct === 100
    ? "Perfect score! You've mastered this topic! 🎉"
    : pct >= 90
    ? "Outstanding work — excellent understanding!"
    : pct >= 70
    ? "Good job! You've passed the chapter threshold."
    : pct >= 50
    ? "Getting there — review the sections you missed."
    : "Keep studying and try again — you've got this!";

  return (
    <div className="quiz-results">
      {/* Score Ring */}
      <div
        className="results-score-ring"
        style={{ "--score": pct }}
        aria-label={`Score: ${pct}%`}
      >
        <span className="results-score-number">{pct}%</span>
      </div>

      <h2 className="results-title">
        {passed ? "✅ Quiz Complete!" : "📚 Quiz Complete"}
      </h2>
      <p className="results-subtitle">{message}</p>

      <div className="results-stats-row">
        <div className="results-stat-box">
          <div className="stat-val" style={{ color: "var(--color-emerald)" }}>{correct}</div>
          <div className="stat-label">Correct</div>
        </div>
        <div className="results-stat-box">
          <div className="stat-val" style={{ color: "var(--color-rose)" }}>{total - correct}</div>
          <div className="stat-label">Incorrect</div>
        </div>
        <div className="results-stat-box">
          <div className="stat-val">{total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="results-stat-box">
          <div
            className="stat-val"
            style={{ color: passed ? "var(--color-emerald)" : "var(--color-rose)" }}
          >
            {passed ? "PASS" : "FAIL"}
          </div>
          <div className="stat-label">Result</div>
        </div>
      </div>

      <div className="results-actions">
        <button id="retry-quiz-btn" className="btn-primary" onClick={onRetry}>
          🔄 Retry Quiz
        </button>
        <button id="back-learn-btn" className="btn-secondary" onClick={onBack}>
          📖 Back to Learn
        </button>
      </div>
    </div>
  );
}

function QuestionCard({ question, index, total, answered, onAnswer, onNext, onFinish, isLast, correctCount }) {
  // For multi-select: track selected set before submitting
  const [selectedSet, setSelectedSet] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);

  const isMulti = question.isMulti;
  const hasAnswered = answered !== null && answered !== undefined;
  const correctIndices = question.options
    .map((o, i) => (o.correct ? i : -1))
    .filter((i) => i !== -1);

  // Single-select: answer immediately on click
  const handleSingleClick = (optionIndex) => {
    if (hasAnswered) return;
    onAnswer(optionIndex);
  };

  // Multi-select: toggle selection then submit
  const handleMultiToggle = (optionIndex) => {
    if (submitted) return;
    setSelectedSet((prev) => {
      const next = new Set(prev);
      next.has(optionIndex) ? next.delete(optionIndex) : next.add(optionIndex);
      return next;
    });
  };

  const handleMultiSubmit = () => {
    if (selectedSet.size === 0) return;
    setSubmitted(true);
    onAnswer([...selectedSet]);
  };

  // Determine button state classes
  const getOptionClass = (i) => {
    if (!hasAnswered && !submitted) {
      // multi-select pre-submit highlight
      if (isMulti && selectedSet.has(i)) return "option-btn selected";
      return "option-btn";
    }

    const isCorrect = question.options[i].correct;
    const wasSelected = isMulti
      ? (submitted || hasAnswered) && selectedSet.has(i)
      : answered === i;

    if (isCorrect) return "option-btn correct";
    if (wasSelected && !isCorrect) return "option-btn incorrect";
    return "option-btn";
  };

  const wasCorrect = answered !== null && answered !== undefined
    ? isMulti
      ? correctIndices.every((ci) => (Array.isArray(answered) ? answered.includes(ci) : false)) &&
        (Array.isArray(answered) ? answered.every((ai) => correctIndices.includes(ai)) : false)
      : question.options[answered]?.correct
    : false;

  const explanation = question.explanation ||
    question.options.find((o) => o.correct)?.explanation || "";

  const pct = Math.round((correctCount / (index + 1)) * 100);

  return (
    <div className="question-card">
      {/* Progress */}
      <div className="quiz-progress-header" style={{ padding: "var(--space-4) var(--space-5) 0" }}>
        <div className="quiz-progress-meta">
          <span className="quiz-progress-label">Question {index + 1} of {total}</span>
          <span className="quiz-score-live">🎯 {correctCount}/{index + (answered !== null && answered !== undefined ? 1 : 0)} correct</span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Header */}
      <div className="question-card-header">
        <span className="question-type-tag">
          {isMulti ? "Multiple Select" : "Single Answer"}
        </span>
        <FormattedText text={question.text} variant="question" />
      </div>

      {/* Multi-select hint */}
      {isMulti && !hasAnswered && !submitted && (
        <div className="multiselect-note">
          ⚠️ Select all correct answers, then click Submit.
        </div>
      )}

      {/* Options */}
      <div className="options-list">
        {question.options.map((option, i) => (
          <button
            key={i}
            id={`option-${index}-${i}`}
            className={getOptionClass(i)}
            disabled={hasAnswered || submitted}
            onClick={() => isMulti ? handleMultiToggle(i) : handleSingleClick(i)}
          >
            <span className="option-letter">{LETTERS[i]}</span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>

      {/* Multi-select Submit Button */}
      {isMulti && !submitted && !hasAnswered && (
        <div style={{ padding: "0 var(--space-5) var(--space-4)" }}>
          <button
            id={`submit-multi-${index}`}
            className="btn-primary"
            onClick={handleMultiSubmit}
            disabled={selectedSet.size === 0}
            style={{ width: "100%" }}
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* Explanation */}
      {(answered !== null && answered !== undefined || submitted) && explanation && (
        <div className={`explanation-box ${wasCorrect ? "correct-exp" : "incorrect-exp"}`}>
          <div className="explanation-label">
            {wasCorrect ? "✅ Correct!" : "❌ Incorrect"}
          </div>
          <div>{explanation}</div>
        </div>
      )}

      {/* Navigation */}
      {(answered !== null && answered !== undefined || submitted) && (
        <div className="question-actions">
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {wasCorrect ? "Great job on this one!" : "Review the explanation above."}
          </span>
          {isLast ? (
            <button id="finish-quiz-btn" className="btn-primary" onClick={onFinish}>
              View Results 🏆
            </button>
          ) : (
            <button id={`next-question-${index}`} className="btn-primary" onClick={onNext}>
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main QuizEngine ──────────────────────────────────────── */
export default function QuizEngine({ chapterTitle, questions, onFinish, previousHighScore }) {
  const [phase, setPhase] = useState("start"); // 'start' | 'quiz' | 'results'
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qIndex]: selectedIndex | selectedIndexes[] }
  const [correctCount, setCorrectCount] = useState(0);

  const normalisedQuestions = useMemo(
    () => questions.map(normaliseQuestion),
    [questions]
  );

  const handleStart = useCallback(() => {
    const shuffled = shuffleArray(normalisedQuestions);
    setQuizQuestions(shuffled);
    setCurrentIndex(0);
    setAnswers({});
    setCorrectCount(0);
    setPhase("quiz");
  }, [normalisedQuestions]);

  const handleAnswer = useCallback((selectedIndex) => {
    const q = quizQuestions[currentIndex];
    const isMulti = q.isMulti;
    const correctIndices = q.options
      .map((o, i) => (o.correct ? i : -1))
      .filter((i) => i !== -1);

    let isCorrect = false;
    if (isMulti && Array.isArray(selectedIndex)) {
      const selected = [...selectedIndex].sort();
      const correct = [...correctIndices].sort();
      isCorrect =
        selected.length === correct.length &&
        selected.every((v, i) => v === correct[i]);
    } else {
      isCorrect = q.options[selectedIndex]?.correct ?? false;
    }

    setAnswers((prev) => ({ ...prev, [currentIndex]: selectedIndex }));
    if (isCorrect) setCorrectCount((c) => c + 1);
  }, [quizQuestions, currentIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  const handleFinish = useCallback(() => {
    const score = Math.round((correctCount / quizQuestions.length) * 100);
    onFinish(score);
    setPhase("results");
  }, [correctCount, quizQuestions.length, onFinish]);

  const handleRetry = useCallback(() => {
    handleStart();
  }, [handleStart]);

  const handleBackToLearn = useCallback(() => {
    setPhase("start");
  }, []);

  /* ── Render ── */
  if (phase === "start") {
    return (
      <StartScreen
        chapterTitle={chapterTitle}
        totalQuestions={normalisedQuestions.length}
        previousHighScore={previousHighScore}
        onStart={handleStart}
      />
    );
  }

  if (phase === "results") {
    return (
      <ResultsScreen
        score={Math.round((correctCount / quizQuestions.length) * 100)}
        total={quizQuestions.length}
        correct={correctCount}
        onRetry={handleRetry}
        onBack={handleBackToLearn}
      />
    );
  }

  // Quiz phase
  const currentQuestion = quizQuestions[currentIndex];
  const currentAnswer = answers[currentIndex] ?? null;
  const isLast = currentIndex === quizQuestions.length - 1;

  if (!currentQuestion) return null;

  return (
    <QuestionCard
      key={currentIndex}
      question={currentQuestion}
      index={currentIndex}
      total={quizQuestions.length}
      answered={currentAnswer}
      correctCount={correctCount}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onFinish={handleFinish}
      isLast={isLast}
    />
  );
}
