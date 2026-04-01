"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Certificate, { AIReport } from "@/components/Certificate";
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

export default function VerifyView({ initialRecord }: { initialRecord: AssessmentRecord }) {
  const [record] = useState<AssessmentRecord>(initialRecord);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] flex flex-col font-sans">
      {/* Network Status Header */}
      <div className="bg-[#1B2E4B] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/50">
              Registry Node 001 / VERIFICATION PORTAL
            </span>
          </div>
          <div className="flex items-center gap-6">
             <span className="font-mono text-[9px] tracking-widest text-white/30 hidden sm:block">STATUS: BIOMETRICALLY VERIFIED</span>
             <span className="font-mono text-[9px] tracking-widest text-[#6EE7B7] font-bold">HCA-PROTOCOL-V1.4</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-[#1A1A1A]/10 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#1B2E4B] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-wider">HCA</span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-[#1B2E4B] uppercase tracking-widest">
                modernhuman.io
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/registry" className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#1B2E4B]/40 hover:text-[#1B2E4B] transition-colors">
              [ Public Registry ]
            </Link>
            <Link href="/assess" className="bg-[#1B2E4B] text-white px-6 py-2.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[#1B2E4B]/90 transition-all shadow-lg">
              Get Certified
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Status & ID Column */}
          <div className="lg:col-span-5 space-y-10">
            <div className="p-8 bg-white border border-[#1A1A1A]/10 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="w-24 h-24 border-4 border-[#1B2E4B] rounded-full" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-emerald-700">
                    Humanity Validation Confirmed
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <div className="font-mono text-[9px] text-[#1B2E4B]/30 uppercase tracking-[0.3em] mb-2 font-bold">Subject Identity</div>
                <div className="text-4xl font-bold text-[#1B2E4B] tracking-tight truncate leading-tight">
                  {record.name}
                </div>
                <div className="mt-4 flex items-center flex-wrap gap-4">
                  <div className="bg-[#1B2E4B] text-white px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase shadow-md">
                    {record.certification_tier} TIER
                  </div>
                  <div className="font-mono text-[9px] text-[#1B2E4B]/40 uppercase tracking-widest bg-[#1B2E4B]/5 px-3 py-1.5">
                    UUID: {record.id.slice(0, 14)}...
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#1A1A1A]/5">
                <div>
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#1A1A1A]/35 mb-2">Humanity Score</div>
                  <div className="text-4xl font-bold text-[#1B2E4B] font-mono leading-none">
                    {record.modern_human_score}
                    <span className="text-xs font-normal opacity-20 ml-1">/1000</span>
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#1A1A1A]/35 mb-2">Bioclinical Tier</div>
                  <div className="text-lg font-bold text-[#1B2E4B]">
                    {record.certification_tier}
                  </div>
                  <div className="text-[9px] font-mono text-[#1A1A1A]/40 uppercase tracking-widest mt-1">
                    {record.ai_report.tierDescriptor}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A]/35 border-b border-[#1A1A1A]/10 pb-3 flex justify-between items-end">
                <span>Subject Archives</span>
                <span className="text-[8px] opacity-40">ENCRYPTED / READ-ONLY</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#1A1A1A]/10 p-5 group transition-all">
                  <div className="font-mono text-[9px] text-[#1B2E4B] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     Hard Proof Diagnostic
                  </div>
                  <div className="bg-[#1B2E4B]/[0.02] border border-[#1B2E4B]/5 rounded-sm overflow-hidden">
                    {record.drawing_path ? (
                      <DrawingReplay strokes={record.drawing_path} />
                    ) : (
                      <div className="p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={record.drawing_url} alt="Human drawing" className="w-full h-auto grayscale opacity-90" />
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-[9px] font-mono text-[#1A1A1A]/40 leading-relaxed uppercase tracking-widest italic leading-tight">
                     Sub-second organic variance stream. Definitive non-AI signature.
                  </p>
                </div>

                {record.webcam_url && (
                  <div className="bg-white border border-[#1A1A1A]/10 p-5">
                    <div className="font-mono text-[9px] text-[#1B2E4B] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                       Biometric Presence
                    </div>
                    <div className="bg-[#1B2E4B]/[0.02] border border-[#1B2E4B]/5 rounded-sm overflow-hidden aspect-square flex items-center justify-center">
                      <div className="relative w-full h-full">
                         {/* Scan line effect */}
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent h-1/2 w-full animate-scan z-10 pointer-events-none" />
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img src={record.webcam_url} alt="Subject scan" className="w-full h-full object-cover grayscale brightness-110 contrast-125" />
                      </div>
                    </div>
                    <p className="mt-4 text-[9px] font-mono text-[#1A1A1A]/40 leading-relaxed uppercase tracking-widest italic leading-tight">
                       High-fidelity biometric capture / Temporal verification active.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Column */}
          <div className="lg:col-span-7 space-y-12">
            <div className="bg-[#1B2E4B] text-white p-10 md:p-14 shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 font-mono text-[70px] font-bold text-white/[0.03] leading-none select-none pointer-events-none -mr-4 -mt-4">REC</div>
              
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-emerald-400/60 mb-8 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Assessment Synthesis
              </div>
              <p className="text-xl md:text-2xl font-serif italic leading-relaxed text-white/90 mb-10">
                &ldquo;{record.ai_report.overallAnalysis}&rdquo;
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-10 border-t border-white/10">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2">Issue Date</div>
                  <div className="text-xs font-mono text-white/70">{new Date(record.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2">Protocol Rev</div>
                  <div className="text-xs font-mono text-white/70">HCA-V1.4-SECURE</div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2">Subject UUID</div>
                  <div className="text-[9px] font-mono text-white/50 break-all">{record.id}</div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A]/35 border-b border-[#1A1A1A]/10 pb-4 flex justify-between">
                <span>Clinical Domain Breakdown</span>
                <span className="text-[9px] text-[#1B2E4B] font-bold tracking-widest uppercase opacity-40 italic">Bioclinical Signature Alpha</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["bio-sensory", "cognitive-friction", "temporal-value", "irrational-link", "motor-autonomy", "biometric-presence"].map((key) => {
                  const domain = record.ai_report.domains[key];
                  if (!domain) return null;
                  return (
                    <div key={key} className="border border-[#1A1A1A]/10 p-6 bg-white hover:border-[#1B2E4B]/30 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-[#1A1A1A]/5">
                        <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-[#1B2E4B]">{domain.label}</span>
                        <div className="flex items-center gap-3">
                           <div className="w-16 h-1.5 bg-[#1B2E4B]/5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${domain.score}%` }} />
                           </div>
                           <span className="font-mono text-[11px] font-bold text-[#1B2E4B]">{domain.score}/100</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-serif italic">
                        {domain.analysis}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Status Assets - Moved from Assess Results */}
            <div className="pt-20">
               <Certificate
                  name={record.name}
                  webcamScore={record.modern_human_score} // Mapping score back
                  drawingScore={100} // Placeholder for the component's internal logic
                  drawingImageUrl={record.drawing_url || ""}
                  issuedAt={new Date(record.created_at)}
                  aiReport={record.ai_report}
                  webcamImageUrl={record.webcam_url}
                  dbId={record.id}
               />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#1A1A1A]/5 py-20 mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#1B2E4B] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold tracking-wider">HCA</span>
                </div>
                <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#1B2E4B]">Human Certification Authority</span>
              </div>
              <p className="text-xs text-[#1A1A1A]/40 font-mono tracking-widest leading-relaxed uppercase">
                A public registry for high-fidelity biological identities. Establishing the standard for proof-of-humanity in a post-AI world.
              </p>
            </div>
            
            <div className="flex gap-16 font-mono text-[10px] tracking-widest uppercase">
              <div className="space-y-4">
                <div className="text-[#1A1A1A]/20 font-bold mb-6">Protocols</div>
                <Link href="/assess" className="block text-[#1B2E4B]/60 hover:text-[#1B2E4B] transition-colors">[ GET CERTIFIED ]</Link>
                <Link href="/registry" className="block text-[#1B2E4B]/60 hover:text-[#1B2E4B] transition-colors">[ REGISTER VIEW ]</Link>
              </div>
              <div className="space-y-4">
                <div className="text-[#1A1A1A]/20 font-bold mb-6">Authority</div>
                <Link href="/" className="block text-[#1B2E4B]/60 hover:text-[#1B2E4B] transition-colors">Documentation</Link>
                <Link href="/" className="block text-[#1B2E4B]/60 hover:text-[#1B2E4B] transition-colors">Legal Framework</Link>
              </div>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-[#1A1A1A]/5 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[9px] text-[#1A1A1A]/20 uppercase tracking-[0.3em]">
             <span>ISO-HCA-9001-2026 / REGISTRY NODE GLOBAL</span>
             <span>© 2026 Human Certification Authority</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
