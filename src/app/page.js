import { getCertifications } from "@/lib/certs";
import CertCatalog from "@/components/CertCatalog";

export const metadata = {
  title: "CertBuddy — Certification Study Guides & Practice Exams",
  description:
    "Pick a certification, study each section, and test yourself with chapter quizzes, practice exams, and a final exam.",
};

export default function Home() {
  const certifications = getCertifications();
  return <CertCatalog certifications={certifications} />;
}
