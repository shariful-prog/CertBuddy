import fs from "node:fs";
import path from "node:path";
import { certifications } from "@/manifest";

const DATA_DIR = path.join(process.cwd(), "public", "data");

/** All certification summaries (from the generated manifest). */
export function getCertifications() {
  return certifications;
}

/** A single certification summary, or undefined. */
export function getCertSummary(slug) {
  return certifications.find((c) => c.slug === slug);
}

/**
 * Full content for one certification, read from the compiled JSON.
 * Server-side only — used at build time by statically prerendered routes.
 */
export function getCert(slug) {
  if (!certifications.some((c) => c.slug === slug)) return null;
  const file = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** Locate a study chapter within a cert by its id. */
export function findChapter(cert, chapterId) {
  for (const domain of cert.domains) {
    const chapter = domain.chapters.find((c) => c.id === chapterId);
    if (chapter) return { chapter, domain };
  }
  return { chapter: null, domain: null };
}

/** Locate a practice exam by id. */
export function findPracticeExam(cert, examId) {
  return cert.practiceExams.find((e) => e.id === examId) || null;
}
