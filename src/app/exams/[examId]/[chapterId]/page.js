import React from "react";
import Link from "next/link";
import { examData } from "@/data";
import ChapterClient from "@/components/ChapterClient";

// 1. Generate Static Paths at build time for all chapters
export async function generateStaticParams() {
  const params = [];
  
  examData.domains.forEach(domain => {
    domain.chapters.forEach(chapter => {
      params.push({
        examId: examData.id,
        chapterId: chapter.id,
      });
    });
  });
  
  return params;
}

// 2. Generate dynamic SEO metadata for each page
export async function generateMetadata({ params }) {
  const { examId, chapterId } = await params;
  
  // Find active chapter
  let activeChapter = null;
  examData.domains.forEach(domain => {
    const found = domain.chapters.find(c => c.id === chapterId);
    if (found) activeChapter = found;
  });

  if (!activeChapter) {
    return {
      title: "Chapter Not Found | CertBuddy",
    };
  }

  return {
    title: `${activeChapter.title} - ${examData.id.toUpperCase()} Practice Guide & Quiz | CertBuddy`,
    description: `Free, interactive prep guide and custom 35-question quiz for "${activeChapter.title}" in the Microsoft ${examData.id.toUpperCase()} Fabric exam.`,
  };
}

// 3. Render the static page shell and pass data to the client
export default async function ChapterPage({ params }) {
  const { examId, chapterId } = await params;
  
  // Locate the active chapter
  let activeChapter = null;
  examData.domains.forEach(domain => {
    const found = domain.chapters.find(c => c.id === chapterId);
    if (found) activeChapter = found;
  });

  if (!activeChapter) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <h1>Chapter Not Found</h1>
        <p>The requested chapter guide could not be located.</p>
        <Link href="/" style={{ color: "var(--color-indigo)", textDecoration: "underline" }}>Return Home</Link>
      </div>
    );
  }

  // Pass necessary study structures
  return (
    <ChapterClient 
      examId={examId}
      chapterId={chapterId}
      examTitle={examData.title}
      domains={examData.domains}
      activeChapter={activeChapter}
    />
  );
}
