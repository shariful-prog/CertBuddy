import { notFound, redirect } from "next/navigation";
import { getCertifications, getCert, getFinalExams } from "@/lib/certs";

export function generateStaticParams() {
  return getCertifications()
    .filter((c) => c.hasFinalExam)
    .map((c) => ({ cert: c.slug }));
}

// `/exams/<cert>/final` redirects to the first final exam so existing links keep working.
export default async function FinalExamIndexPage({ params }) {
  const { cert: slug } = await params;
  const cert = getCert(slug);
  if (!cert) notFound();
  const finals = getFinalExams(cert);
  if (!finals.length) notFound();

  redirect(`/exams/${slug}/final/${finals[0].id}`);
}
