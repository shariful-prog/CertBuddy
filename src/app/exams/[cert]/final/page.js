import { notFound } from "next/navigation";
import { getCertifications, getCert } from "@/lib/certs";
import ExamRunner from "@/components/ExamRunner";

export function generateStaticParams() {
  return getCertifications()
    .filter((c) => c.hasFinalExam)
    .map((c) => ({ cert: c.slug }));
}

export async function generateMetadata({ params }) {
  const { cert: slug } = await params;
  const cert = getCert(slug);
  if (!cert || !cert.finalExam) return { title: "Final Exam Not Found | CertBuddy" };
  return {
    title: `${cert.finalExam.title} — ${cert.code} | CertBuddy`,
    description: `Full-length ${cert.finalExam.questions.length}-question final exam for ${cert.code}.`,
  };
}

export default async function FinalExamPage({ params }) {
  const { cert: slug } = await params;
  const cert = getCert(slug);
  if (!cert || !cert.finalExam) notFound();

  return (
    <ExamRunner
      cert={{ slug: cert.slug, code: cert.code }}
      kind="final"
      exam={cert.finalExam}
    />
  );
}
