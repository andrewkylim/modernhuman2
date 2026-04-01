"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ─── Biometric iris scan SVG ──────────────────────────────────────────────────

function BiometricViz({ dark = false }: { dark?: boolean }) {
  const stroke = dark ? "rgba(255,255,255,0.9)" : "#1B2E4B";
  const dim    = dark ? "rgba(255,255,255,0.5)" : "#1B2E4B";

  const ticks = Array.from({ length: 48 }, (_, i) => {
    const angle = (i * 7.5 * Math.PI) / 180;
    const isMajor = i % 6 === 0;
    const r1 = isMajor ? 132 : 135;
    return {
      x1: 160 + r1      * Math.cos(angle),
      y1: 160 + r1      * Math.sin(angle),
      x2: 160 + 139     * Math.cos(angle),
      y2: 160 + 139     * Math.sin(angle),
      major: isMajor,
    };
  });

  return (
    <div className="relative w-full max-w-[420px] mx-auto select-none group">
      {/* Face Image Background Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.45] group-hover:opacity-[0.6] transition-opacity duration-1000 scale-95 group-hover:scale-100 transform duration-1000">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/images/face.png" 
          alt="" 
          className="w-full h-full object-contain mix-blend-lighten brightness-150 contrast-125"
        />
      </div>

      <svg viewBox="0 0 320 320" className="w-full h-full relative z-10" aria-hidden="true">

        {/* Static rings */}
        {[140, 112, 86, 62, 40, 20, 8].map((r, i) => (
          <circle key={r} cx="160" cy="160" r={r}
            stroke={dim} strokeWidth={i >= 4 ? 1 : 0.5}
            fill="none" opacity={dark ? 0.06 + i * 0.065 : 0.06 + i * 0.055} />
        ))}

        {/* Crosshairs */}
        <line x1="0"   y1="160" x2="320" y2="160" stroke={dim} strokeWidth="0.5" opacity={dark ? 0.18 : 0.1} />
        <line x1="160" y1="0"   x2="160" y2="320" stroke={dim} strokeWidth="0.5" opacity={dark ? 0.18 : 0.1} />

        {/* Diagonal guides */}
        <line x1="60"  y1="60"  x2="104" y2="104" stroke={dim} strokeWidth="0.5" opacity={dark ? 0.22 : 0.15} />
        <line x1="260" y1="60"  x2="216" y2="104" stroke={dim} strokeWidth="0.5" opacity={dark ? 0.22 : 0.15} />
        <line x1="60"  y1="260" x2="104" y2="216" stroke={dim} strokeWidth="0.5" opacity={dark ? 0.22 : 0.15} />
        <line x1="260" y1="260" x2="216" y2="216" stroke={dim} strokeWidth="0.5" opacity={dark ? 0.22 : 0.15} />

        {/* Rotating tick ring */}
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from="0 160 160" to="360 160 160" dur="90s" repeatCount="indefinite" />
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={dim} strokeWidth={t.major ? 1 : 0.5}
              opacity={t.major ? (dark ? 0.55 : 0.4) : (dark ? 0.28 : 0.2)} />
          ))}
        </g>

        {/* Counter-rotating arcs */}
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from="0 160 160" to="-360 160 160" dur="180s" repeatCount="indefinite" />
          <path d="M 160 21 A 139 139 0 0 1 299 160" stroke={dim} strokeWidth="1.5" fill="none" opacity={dark ? 0.35 : 0.18} />
          <path d="M 160 299 A 139 139 0 0 1 21 160"  stroke={dim} strokeWidth="1.5" fill="none" opacity={dark ? 0.35 : 0.18} />
        </g>

        {/* Cardinal dots */}
        {([[160,21],[299,160],[160,299],[21,160]] as [number,number][]).map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill={dim} opacity={dark ? 0.6 : 0.45} />
        ))}

        {/* Corner brackets */}
        <path d="M 14 46 L 14 14 L 46 14"   stroke={stroke} strokeWidth="1.5" fill="none" opacity={dark ? 0.55 : 0.4} />
        <path d="M 306 46 L 306 14 L 274 14" stroke={stroke} strokeWidth="1.5" fill="none" opacity={dark ? 0.55 : 0.4} />
        <path d="M 14 274 L 14 306 L 46 306"  stroke={stroke} strokeWidth="1.5" fill="none" opacity={dark ? 0.55 : 0.4} />
        <path d="M 306 274 L 306 306 L 274 306" stroke={stroke} strokeWidth="1.5" fill="none" opacity={dark ? 0.55 : 0.4} />

        {/* Pulsing centre */}
        <circle cx="160" cy="160" r="5" fill={dark ? "rgba(52,211,153,0.15)" : "rgba(27,46,75,0.1)"}>
          <animate attributeName="r"       values="5;9;5"       dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0.3;0.15" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="160" cy="160" r="3" fill={dark ? "#34d399" : "#1B2E4B"} opacity={dark ? 0.85 : 0.7} />
      </svg>

      {/* Data labels */}
      <div className="absolute top-5 right-10 text-right pointer-events-none">
        <div className={`font-mono text-[8px] tracking-[0.2em] uppercase ${dark ? "text-white/30" : "text-[#1B2E4B]/35"}`}>Scan ID</div>
        <div className={`font-mono text-[10px] mt-0.5 ${dark ? "text-white/50" : "text-[#1B2E4B]/55"}`}>HCA-7291-Ω</div>
      </div>
      <div className="absolute bottom-5 left-10 pointer-events-none">
        <div className={`font-mono text-[8px] tracking-[0.2em] uppercase ${dark ? "text-white/30" : "text-[#1B2E4B]/35"}`}>Status</div>
        <div className={`font-mono text-[10px] mt-0.5 ${dark ? "text-emerald-400/70" : "text-[#1B2E4B]/55"}`}>
          Awaiting subject
        </div>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none">
        <div className={`font-mono text-[8px] ${dark ? "text-white/20" : "text-[#1B2E4B]/25"}`}
          style={{ writingMode: "vertical-rl" }}>
          Rev.14.2
        </div>
      </div>
    </div>
  );
}

// ─── Constants (Used below in the component) ──────────────────────────────────

const PROTOCOL_STEPS = [
  { number: "01", title: "Biometric Scan", description: "Overt capture of asymmetric facial structure. Machine perfection is ground for immediate rejection." },
  { number: "02", title: "Movement Diagnostic", description: "Hard Proof capture of manual coordinate streams. Organic velocity and tremor analysis." },
  { number: "03", title: "Cognitive Synthesis", description: "Analysis of irrationality and subjective experience. Measuring deep-layer unpredictability." },
  { number: "04", title: "Dossier Issued", description: "Your unique record is added to the Global Humanity Registry. Secure sharing without account requirements." },
];

const SECURITY_TIERS = [
  { name: "Bronze", range: "0 – 45", label: "Fundamental Humanity", desc: "Confirmed biological origin with standard cognitive variance. Baseline organic response." },
  { name: "Silver", range: "46 – 58", label: "Cognitive Variability", desc: "Frequent non-linear decision-making. Distinct deviation from algorithmic logic." },
  { name: "Gold", range: "59 – 70", label: "High-Index Mortality", desc: "Reflects profound awareness of temporal constraints and value-based prioritization." },
  { name: "Platinum", range: "71 – 84", label: "Behavioral Resilience", desc: "History of multi-stage error cycles and successful organic recovery patterns." },
  { name: "Diamond", range: "85 – 100", label: "Peak Unpredictability", desc: "Maximum behavioral deviation from algorithmic prediction. Definitive human status." },
];

// ─── Main Home Component ──────────────────────────────────────────────────────

export default function Home() {
  const [humanCount, setHumanCount] = useState<string>("47,284");

  useEffect(() => {
    async function fetchCount() {
      try {
        const { count, error } = await supabase
          .from("assessments")
          .select("*", { count: "exact", head: true });
        
        if (!error && count !== null) {
          setHumanCount(count.toLocaleString());
        }
      } catch (err) {
        console.error("Failed to fetch human count:", err);
      }
    }
    fetchCount();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">

      {/* ── Dark header + hero block ─────────────────────────────────────────── */}
      <div className="bg-[#1B2E4B]">

        {/* Header */}
        <header>
          <div className="border-b border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40">
                  Global Identification Node Active
                </span>
              </div>
              <span className="font-mono text-[9px] tracking-widest text-white/25 hidden sm:block">
                HCA-Registry / Network Status: SECURE
              </span>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-white/25 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold tracking-wider">HCA</span>
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide text-white font-mono uppercase tracking-widest">modernhuman.io</div>
                <div className="text-[10px] text-white/40 tracking-widest uppercase">Human Certification Authority</div>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-white/50 font-mono">
              <a href="#protocol" className="hover:text-white transition-colors">Protocol</a>
              <Link href="/registry" className="hover:text-white transition-colors">Registry</Link>
              <Link
                href="/assess/"
                className="bg-white text-[#1B2E4B] px-4 py-2 hover:bg-white/90 transition-colors normal-case text-xs tracking-wide font-medium"
              >
                Claim Your Human Status
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section>
          <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-16 items-center">

            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="h-px w-6 bg-emerald-400/50" />
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/35">
                  The Global Standard for Biological Identity
                </span>
              </div>

              <h1 className="mb-8 leading-none">
                <span className="block font-mono text-sm tracking-[0.25em] uppercase text-white/40 mb-4">
                  Prove you are
                </span>
                <span className="block text-[56px] sm:text-[80px] md:text-[96px] font-bold tracking-tight text-white leading-[0.92]">
                  REAL.
                </span>
              </h1>

              {/* Mobile Radar (Under title) */}
              <div className="md:hidden mb-12 opacity-90 scale-90 -mt-4">
                <BiometricViz dark />
              </div>

              <p className="text-[16px] text-white/65 max-w-sm leading-relaxed mb-6 font-serif italic">
                In an era of synthetic consciousness, being &quot;real&quot; is no longer a given. 
                Defend your biological identity with the Global Human Registry.
              </p>
              <p className="text-sm text-white/40 max-w-sm leading-relaxed mb-10 font-mono uppercase tracking-widest">
                Our Movement Diagnostic captures sub-second organic variance—the &apos;Hard Proof&apos; that AI cannot simulate.
              </p>

              <Link
                href="/assess/"
                className="inline-flex items-center gap-4 bg-white text-[#1B2E4B] px-10 py-5 text-sm tracking-widest uppercase font-bold hover:bg-white/90 transition-colors shadow-2xl"
              >
                Claim Your Human Status
                <span className="font-mono text-[#1B2E4B]/40 text-xs">→</span>
              </Link>
            </div>

            {/* Desktop Radar */}
            <div className="hidden md:block">
              <BiometricViz dark />
            </div>
          </div>
        </section>
      </div>

      {/* ── Stat bar ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#1A1A1A]/8 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 divide-y xs:divide-y-0 xs:divide-x divide-[#1A1A1A]/8">
          {[
            { value: humanCount, label: "Verified human records",    ref: "A" },
            { value: "0.0012%",  label: "False positive rate",      ref: "B" },
            { value: "Rev. 15.0", label: "Active Protocol",         ref: "C" },
            { value: "Global",    label: "Registry access",         ref: "D" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 xs:first:pl-0 xs:last:pr-0 py-4 xs:py-1">
              <div className="flex items-start justify-between mb-1">
                <div className="text-xl font-semibold text-[#1B2E4B] tracking-tight">{stat.value}</div>
                <div className="font-mono text-[8px] text-[#1A1A1A]/20 tracking-widest mt-1">{stat.ref}</div>
              </div>
              <div className="text-[10px] text-[#1A1A1A]/45 tracking-wide uppercase font-mono">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Protocol ──────────────────────────────────────────────────────────── */}
      <section id="protocol" className="bg-[#1B2E4B] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/35 mb-2">
              Assessment Protocol / HCA-P-015
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">Institutional Validation</h2>
            <p className="text-sm text-white/40 mt-4 max-w-lg leading-relaxed font-serif italic">
              Our assessment goes beyond simple logic. We capture the physical and cognitive 
              anomalies that define biological life.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-0 border border-white/10">
            {PROTOCOL_STEPS.map((step, i, arr) => (
              <div
                key={step.number}
                className={`p-10 relative ${i < arr.length - 1 ? "border-b md:border-b-0 md:border-r border-white/10" : ""}`}
              >
                <div className="font-mono text-4xl font-semibold text-white/5 mb-8 tracking-tighter">
                  {step.number}
                </div>
                <h3 className="text-[11px] font-bold text-white mb-4 uppercase tracking-[0.2em]">{step.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed font-serif italic">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Registry ────────────────────────────────────────────────────────────── */}
      <section id="registry" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#1A1A1A]/35 mb-2">
                Classification Framework / HCA-C-005
              </div>
              <h2 className="text-4xl font-bold text-[#1B2E4B] tracking-tight">HCA Security Tiers</h2>
              <p className="text-sm text-[#1A1A1A]/45 mt-4 max-w-lg leading-relaxed font-serif italic">
                Tier assignment reflects the intensity of documented organic anomalies—the richness of 
                your internal chaos and contradictions.
              </p>
            </div>
            <Link href="/assess/" className="bg-[#1B2E4B] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#1B2E4B]/90 transition-colors shadow-2xl">
              Claim Your Human Status
            </Link>
          </div>

          <div className="grid gap-4">
            {SECURITY_TIERS.map((tier) => (
              <div
                key={tier.name}
                className="flex items-start gap-12 px-10 py-8 bg-[#FAFAF8] border border-[#1A1A1A]/10 group hover:border-[#1B2E4B]/30 transition-all"
              >
                <div className="w-32 shrink-0 pt-1">
                  <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#1B2E4B] mb-2">
                    {tier.name}
                  </div>
                  <div className="font-mono text-[10px] text-[#1A1A1A]/30 tracking-widest uppercase">{tier.range}</div>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-[#1B2E4B] mb-3 tracking-wide">{tier.label}</div>
                  <div className="text-sm text-[#1A1A1A]/50 leading-relaxed max-w-2xl italic font-serif">&ldquo;{tier.desc}&rdquo;</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="bg-[#1B2E4B] py-32 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="font-mono text-[9px] tracking-[0.4em] uppercase text-white/35 mb-8">
              HCA Registry Access / Primary Portal
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white leading-tight tracking-tight">Claim Your Human Status</h2>
            <p className="text-lg text-white/40 mb-12 leading-relaxed max-w-lg mx-auto font-serif italic">
              Your biological record is verifiable instantly across all nodes. Valid for 12 months. 
              Secure your status on the global ledger.
            </p>
            <Link
              href="/assess/"
              className="inline-flex items-center gap-4 bg-white text-[#1B2E4B] px-14 py-6 text-sm tracking-widest uppercase font-bold hover:bg-white/90 transition-colors shadow-2xl"
            >
              Consult the HCA Protocol
              <span className="text-base">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#1A1A1A] text-white/20">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 font-mono text-[9px] tracking-[0.3em] uppercase">
             <div className="flex items-center gap-4">
              <div className="w-5 h-5 border border-white/20 flex items-center justify-center">
                <span className="text-white text-[7px] font-bold">HCA</span>
              </div>
              <span className="text-white/40">Human Certification Authority Registry Node 001</span>
            </div>
            <div className="flex gap-12">
              <span className="hover:text-white transition-colors cursor-help">ISO-9001:21</span>
              <span className="hover:text-white transition-colors cursor-help">IHR-Registry</span>
              <span className="hover:text-white transition-colors cursor-help">Public Ethics Port</span>
            </div>
          </div>
          <div className="mt-12 text-[9px] text-white/5 uppercase tracking-[0.4em] text-center border-t border-white/5 pt-12">
            This record represents a biological verification event. All movement data is captured and archived.
          </div>
        </div>
      </footer>
    </div>
  );
}
