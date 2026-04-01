"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const cert = searchParams.get("cert");

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] flex flex-col">

      {/* Header */}
      <div className="bg-[#1B2E4B]">
        <div className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40">
                Certificate verification portal
              </span>
            </div>
            <span className="font-mono text-[9px] tracking-widest text-white/25 hidden sm:block">
              modernhuman.io / HCA Portal
            </span>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/25 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-wider">HCA</span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-white">modernhuman.io</div>
              <div className="text-[10px] text-white/40 tracking-widest uppercase">Human Certification Authority</div>
            </div>
          </div>
          <a
            href="/"
            className="text-xs tracking-widest uppercase text-white/50 hover:text-white transition-colors"
          >
            Home
          </a>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        {!cert ? (
          <div className="text-center">
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#1A1A1A]/35 mb-4">
              Verification Error
            </div>
            <p className="text-lg font-semibold text-[#1A1A1A]">No certificate number provided</p>
            <p className="text-sm text-[#1A1A1A]/45 mt-2">
              Append <code className="font-mono bg-[#1A1A1A]/6 px-1.5 py-0.5">?cert=YOUR-CERT-ID</code> to the URL.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-xl">

            {/* Status badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="font-mono text-xs font-semibold tracking-widest uppercase text-emerald-700">
                  Certificate Valid
                </span>
              </div>
            </div>

            {/* Cert number */}
            <div className="mb-8">
              <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#1A1A1A]/35 mb-2">
                Certificate Number
              </div>
              <div className="font-mono text-3xl font-bold text-[#1B2E4B] tracking-wide break-all">
                {cert}
              </div>
            </div>

            {/* Details card */}
            <div className="border border-[#1A1A1A]/10 divide-y divide-[#1A1A1A]/8">
              <div className="px-6 py-4">
                <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#1A1A1A]/35 mb-1">
                  Issued by
                </div>
                <div className="text-sm font-semibold text-[#1A1A1A]">Human Certification Authority</div>
                <div className="font-mono text-[10px] text-[#1A1A1A]/40 mt-0.5">modernhuman.io · Registration No. IHR-7291</div>
              </div>

              <div className="px-6 py-4">
                <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#1A1A1A]/35 mb-2">
                  Certificate Basis
                </div>
                <p className="text-sm text-[#1A1A1A]/65 leading-relaxed">
                  This certificate was issued following completion of the standard Human Assessment
                  Protocol (HAP-001). Validity: 12 months from date of issue.
                </p>
              </div>

              <div className="px-6 py-4 bg-[#1A1A1A]/2">
                <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#1A1A1A]/35 mb-2">
                  Verification Note
                </div>
                <p className="text-xs text-[#1A1A1A]/45 leading-relaxed">
                  Verification confirms certificate authenticity. It does not guarantee continued human status.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <div className="h-px flex-1 bg-[#1A1A1A]/8" />
              <span className="font-mono text-[9px] text-[#1A1A1A]/25 tracking-widest uppercase">
                Human Standard Rev. 14.2
              </span>
              <div className="h-px flex-1 bg-[#1A1A1A]/8" />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white/40">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-[9px] tracking-wide">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border border-white/20 flex items-center justify-center">
                <span className="text-white text-[7px] font-bold tracking-wider">HCA</span>
              </div>
              <span>&copy; 2026 Human Certification Authority. All certification rights reserved.</span>
            </div>
            <div className="flex gap-6 text-white/20">
              <span>Privacy Policy</span>
              <span>Terms of Certification</span>
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
        <span className="font-mono text-sm text-[#1A1A1A]/40 tracking-widest">Verifying...</span>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
