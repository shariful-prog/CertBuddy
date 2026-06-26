import { notFound } from "next/navigation";
import { getCertifications, getCert, getFinalExams, findFinalExam } from "@/lib/certs";
import ExamRunner from "@/components/ExamRunner";

export function generateStaticParams() {
  const params = [];
  for (const summary of getCertifications()) {
    const cert = getCert(summary.slug);
    if (!cert) continue;
    for (const exam of getFinalExams(cert)) {
      params.push({ cert: cert.slug, examId: exam.id });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { cert: slug, examId } = await params;
  const cert = getCert(slug);
  const exam = cert && findFinalExam(cert, examId);
  if (!exam) return { title: "Final Exam Not Found | CertBuddy" };
  return {
    title: `${exam.title} — ${cert.code} | CertBuddy`,
    description: `Full-length ${exam.questions.length}-question final exam for ${cert.code}.`,
  };
}

export default async function FinalExamPage({ params }) {
  const { cert: slug, examId } = await params;
  const cert = getCert(slug);
  if (!cert) notFound();
  const exam = findFinalExam(cert, examId);
  if (!exam) notFound();

  return (
    <ExamRunner
      cert={{ slug: cert.slug, code: cert.code }}
      kind="final"
      examId={examId}
      exam={exam}
    />
  );
}
