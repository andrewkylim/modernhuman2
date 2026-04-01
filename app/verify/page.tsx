"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { AIReport } from "@/components/Certificate";
import DrawingReplay from "@/components/DrawingReplay";

interface Point {
  x: number;
  y: number;
  time: number;
}

interface Stroke {
  points: Point[];
}

interface AssessmentRecord {
  id: string;
  name: string;
  modern_human_score: number;
  certification_tier: string;
  ai_report: AIReport;
  webcam_url?: string;
  drawing_url?: string;
  drawing_path?: Stroke[];
  created_at: string;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [record, setRecord] = useState<AssessmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchRecord() {
      setLoading(true);
      try {
        const { data, error: dbErr } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", id)
          .single();

        if (dbErr) throw dbErr;
        setRecord(data);
      } catch (err: unknown) {
        console.error("Verification error:", err);
        const msg = err instanceof Error ? err.message : "Certificate not found or invalid.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchRecord();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#1B2E4B] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[10px] tracking-widest text-[#1A1A1A]/40 uppercase">
            Consulting Registry...
          </span>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-red-500 mb-4 font-bold">
            Verification Protocol Error
          </div>
          <h2 className="text-2xl font-bold text-[#1B2E4B] mb-2">Registry Mismatch</h2>
          <p className="text-sm text-[#1A1A1A]/60 leading-relaxed mb-8">
            The provided certificate identifier <code className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">{id}</code> could not be located in the Human Certification Authority global registry.
          </p>
          <Link href="/" className="bg-[#1B2E4B] text-white px-8 py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-[#1B2E4B]/90 transition-colors">
            Return to HCA Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] flex flex-col">
      {/* Header */}
      <div className="bg-[#1B2E4B]">
        <div className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40">
                Official Verification Portal
              </span>
            </div>
            <span className="font-mono text-[9px] tracking-widest text-white/25 hidden sm:block">
              HCA-Registry / Network Status: SECURE
            </span>
          </div>
        </div>
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-white/25 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold tracking-wider">HCA</span>
              </div>
              <div className="text-sm font-semibold tracking-wide text-white uppercase tracking-widest">
                Official Humanity Dossier
              </div>
            </div>
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Status & ID Column */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-emerald-700">
                    Certificate Genuine
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="font-mono text-[9px] text-[#1B2E4B]/40 uppercase tracking-[0.2em] mb-1">Subject Identity</div>
                <div className="text-3xl font-bold text-[#1B2E4B] tracking-tight truncate">
                  {record.name}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="bg-[#1B2E4B] text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase">
                    {record.certification_tier} TIER
                  </div>
                  <div className="font-mono text-[9px] text-[#1B2E4B]/40 uppercase tracking-widest">
                    Registry ID: {record.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#1A1A1A]/10">
              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#1A1A1A]/35 mb-2">HCA Score</div>
                <div className="text-4xl font-bold text-[#1B2E4B] font-mono leading-none">
                  {record.modern_human_score}
                  <span className="text-sm font-normal opacity-30 ml-1">/1000</span>
                </div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#1A1A1A]/35 mb-2">Tier Level</div>
                <div className="text-xl font-bold text-[#1B2E4B]">
                  {record.certification_tier}
                </div>
                <div className="text-[10px] font-mono text-[#1A1A1A]/50 uppercase tracking-widest mt-1">
                  {record.ai_report.tierDescriptor}
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#1A1A1A]/35 border-b border-[#1A1A1A]/10 pb-2">
                Biometric Archives
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                   <div className="bg-[#1B2E4B]/5 border border-[#1B2E4B]/10 p-4">
                    <div className="font-mono text-[9px] text-[#1B2E4B] uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       Hard Proof Movement Diagnostic
                    </div>
                    {record.drawing_path ? (
                      <DrawingReplay strokes={record.drawing_path} />
                    ) : (
                      <div className="bg-white border border-[#1A1A1A]/10 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={record.drawing_url} alt="Human drawing" className="w-full h-auto grayscale opacity-80" />
                      </div>
                    )}
                    <p className="mt-3 text-[9px] font-mono text-[#1A1A1A]/40 leading-relaxed uppercase tracking-widest">
                       Data captures sub-second organic variance, manual coordinate streams, and velocity analysis.
                    </p>
                  </div>
                </div>
                {record.webcam_url && (
                  <div className="space-y-2">
                    <p className="font-mono text-[8px] text-[#1A1A1A]/40 uppercase tracking-widest">Biometric Scan</p>
                    <div className="bg-white border border-[#1A1A1A]/10 p-2 overflow-hidden aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={record.webcam_url} alt="Subject scan" className="w-full h-full object-cover grayscale" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Column */}
          <div className="lg:col-span-7 space-y-12">
            <div className="bg-[#1B2E4B] text-white p-8 md:p-12">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/40 mb-6">
                Assessment Synthesis
              </div>
              <p className="text-lg md:text-xl font-serif italic leading-relaxed text-white/90">
                &ldquo;{record.ai_report.overallAnalysis}&rdquo;
              </p>
              <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Date of Issue</div>
                  <div className="text-sm font-mono">{new Date(record.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Registry UUID</div>
                  <div className="text-[10px] font-mono text-white/60">{record.id}</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A]/35 border-b border-[#1A1A1A]/10 pb-3">
                Domain Breakdown
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(record.ai_report.domains).map((domain) => (
                  <div key={domain.label} className="border border-[#1A1A1A]/10 p-4 bg-white/50">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-mono text-[9px] uppercase font-bold tracking-widest">{domain.label}</span>
                      <span className="font-mono text-[11px] opacity-40">{domain.score}/100</span>
                    </div>
                    <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-serif italic">
                      {domain.analysis}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white/40 py-12 border-t border-white/5 mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 font-mono text-[9px] tracking-widest uppercase">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border border-white/20 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">HCA</span>
              </div>
              <span>Certified Human Standard Registry</span>
            </div>
            <div className="flex gap-8 text-white/20">
              <Link href="/" className="hover:text-white transition-colors">Re-evaluate Status</Link>
              <Link href="/" className="hover:text-white transition-colors">Registry Search</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#1B2E4B] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
