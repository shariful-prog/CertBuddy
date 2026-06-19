"use client";

/**
 * Per-certification progress, persisted in localStorage.
 *
 * Shape (v2):
 *   {
 *     [certSlug]: {
 *       completedChapters: string[],          // chapter ids
 *       chapterHighScores: { [chapterId]: pct },
 *       practiceScores:   { [examId]: pct },
 *       finalScore:        pct | undefined
 *     }
 *   }
 */
const STORAGE_KEY = "certbuddy_progress_v2";
const LEGACY_KEY = "certbuddy_progress";

const emptyCert = () => ({
  completedChapters: [],
  chapterHighScores: {},
  practiceScores: {},
  finalScore: undefined,
});

export function loadAllProgress() {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);

    // One-time migration: old global progress belonged to dp-700.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      const migrated = {
        "dp-700": {
          ...emptyCert(),
          completedChapters: parsed.completedChapters || [],
          chapterHighScores: parsed.highScores || {},
        },
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch (e) {
    console.error("Failed to load progress", e);
  }
  return {};
}

export function loadCertProgress(slug) {
  const all = loadAllProgress();
  return { ...emptyCert(), ...(all[slug] || {}) };
}

export function saveCertProgress(slug, certProgress) {
  if (typeof window === "undefined") return;
  try {
    const all = loadAllProgress();
    all[slug] = certProgress;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
}
