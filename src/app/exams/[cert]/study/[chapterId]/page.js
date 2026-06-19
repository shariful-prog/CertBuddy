import { notFound } from "next/navigation";
import { getCertifications, getCert, findChapter } from "@/lib/certs";
import ChapterClient from "@/components/ChapterClient";

export function generateStaticParams() {
  const params = [];
  for (const summary of getCertifications()) {
    const cert = getCert(summary.slug);
    if (!cert) continue;
    for (const domain of cert.domains) {
      for (const chapter of domain.chapters) {
        params.push({ cert: cert.slug, chapterId: chapter.id });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { cert: slug, chapterId } = await params;
  const cert = getCert(slug);
  if (!cert) return { title: "Chapter Not Found | CertBuddy" };
  const { chapter } = findChapter(cert, chapterId);
  if (!chapter) return { title: "Chapter Not Found | CertBuddy" };
  return {
    title: `${chapter.title} — ${cert.code} Study Guide & Quiz | CertBuddy`,
    description: `Interactive prep guide and ${chapter.questions.length}-question quiz for "${chapter.title}" in the ${cert.code} exam.`,
  };
}

export default async function StudyChapterPage({ params }) {
  const { cert: slug, chapterId } = await params;
  const cert = getCert(slug);
  if (!cert) notFound();
  const { chapter } = findChapter(cert, chapterId);
  if (!chapter) notFound();

  return (
    <ChapterClient
      cert={{ slug: cert.slug, code: cert.code, title: cert.title, domains: cert.domains }}
      chapterId={chapterId}
      activeChapter={chapter}
    />
  );
}
