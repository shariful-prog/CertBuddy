import { notFound } from "next/navigation";
import { getCertifications, getCert, findPracticeExam } from "@/lib/certs";
import ExamRunner from "@/components/ExamRunner";

export function generateStaticParams() {
  const params = [];
  for (const summary of getCertifications()) {
    const cert = getCert(summary.slug);
    if (!cert) continue;
    for (const exam of cert.practiceExams) {
      params.push({ cert: cert.slug, examId: exam.id });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { cert: slug, examId } = await params;
  const cert = getCert(slug);
  const exam = cert && findPracticeExam(cert, examId);
  if (!exam) return { title: "Practice Exam Not Found | CertBuddy" };
  return {
    title: `${exam.title} — ${cert.code} Practice Exam | CertBuddy`,
    description: `Full-length ${exam.questions.length}-question ${cert.code} practice exam with answer review.`,
  };
}

export default async function PracticeExamPage({ params }) {
  const { cert: slug, examId } = await params;
  const cert = getCert(slug);
  if (!cert) notFound();
  const exam = findPracticeExam(cert, examId);
  if (!exam) notFound();

  return (
    <ExamRunner
      cert={{ slug: cert.slug, code: cert.code }}
      kind="practice"
      examId={examId}
      exam={exam}
    />
  );
}
