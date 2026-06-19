import { notFound } from "next/navigation";
import { getCertifications, getCert } from "@/lib/certs";
import CertLanding from "@/components/CertLanding";

export function generateStaticParams() {
  return getCertifications().map((c) => ({ cert: c.slug }));
}

export async function generateMetadata({ params }) {
  const { cert: slug } = await params;
  const cert = getCert(slug);
  if (!cert) return { title: "Certification Not Found | CertBuddy" };
  return {
    title: `${cert.code} — ${cert.title} | CertBuddy`,
    description: cert.description,
  };
}

export default async function CertPage({ params }) {
  const { cert: slug } = await params;
  const cert = getCert(slug);
  if (!cert) notFound();
  return <CertLanding cert={cert} />;
}
