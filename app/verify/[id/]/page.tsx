import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import VerifyView from "@/components/VerifyView";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

async function getRecord(id: string) {
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const record = await getRecord(params.id);

  if (!record) {
    return {
      title: "HCA Registry Mismatch",
    };
  }

  return {
    title: `Certified Human: ${record.name} | HCA Registry`,
    description: `Official biological status verification for ${record.name}. Modern Human Score: ${record.modern_human_score}/1000. ${record.ai_report.tierDescriptor}.`,
    openGraph: {
      title: `Verified Human: ${record.name}`,
      description: `Official humanity proof from the Human Certification Authority. Status: ${record.certification_tier} Tier.`,
      images: [
        {
          url: record.webcam_url || "/images/face.png",
          width: 800,
          height: 800,
          alt: `Biometric scan of ${record.name}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Verified Human: ${record.name}`,
      description: `I've been verified as a real human by the HCA. Status: ${record.certification_tier} Tier.`,
      images: [record.webcam_url || "/images/face.png"],
    },
  };
}

export default async function VerifyRecordPage({ params }: PageProps) {
  const record = await getRecord(params.id);

  if (!record) {
    notFound();
  }

  return <VerifyView initialRecord={record} />;
}
