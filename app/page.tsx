import Link from "next/link";

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
    <div className="relative w-full max-w-[380px] mx-auto select-none">
      <svg viewBox="0 0 320 320" className="w-full h-full" aria-hidden="true">

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

// ─── Data ─────────────────────────────────────────────────────────────────────

const tiers = [
  {
    name: "Bronze",
    range: "0 – 45",
    descriptor: "Occasionally Irrational",
    description: "Documented capacity for poor decisions under mild stress. Basic humanity confirmed.",
  },
  {
    name: "Silver",
    range: "46 – 58",
    descriptor: "Reliably Inconsistent",
    description: "Contradicts yourself at least once per week. Verified pattern of changing your mind.",
  },
  {
    name: "Gold",
    range: "59 – 70",
    descriptor: "Certified Mortal",
    description: "Full awareness of your own impermanence. Proceeds anyway. Strong indicator of humanity.",
  },
  {
    name: "Platinum",
    range: "71 – 84",
    descriptor: "Documented Failure History",
    description: "Rich record of mistakes, recoveries, and subsequent repeated mistakes. Highly human.",
  },
  {
    name: "Diamond",
    range: "85 – 100",
    descriptor: "Essentially Chaos",
    description: "Cannot reliably predict your own behavior 24 hours in advance. Peak certification.",
  },
];

const steps = [
  {
    number: "01",
    title: "Biometric Verification",
    description: "Webcam capture confirms humanoid facial structure. Asymmetry is expected. Perfection flags for review.",
  },
  {
    number: "02",
    title: "Drawing Sample",
    description: "Draw a dog from memory. The degree of failure is analyzed. A perfect rendering is grounds for rejection.",
  },
  {
    number: "03",
    title: "Humanity Questionnaire",
    description: "Twelve questions measuring irrationality, inconsistency, and behavioral unpredictability. Correct answers do not exist.",
  },
  {
    number: "04",
    title: "Certificate Issued",
    description: "Results processed by AI against Human Standard Rev. 14.2. A verifiable certificate is issued immediately.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
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
                  Certification portal active
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
            <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-white/50">
              <a href="#process" className="hover:text-white transition-colors">Process</a>
              <a href="#tiers"   className="hover:text-white transition-colors">Tiers</a>
              <Link
                href="/assess/"
                className="bg-white text-[#1B2E4B] px-4 py-2 hover:bg-white/90 transition-colors normal-case text-xs tracking-wide font-medium"
              >
                Begin Assessment
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
                  Biological Verification Protocol · Rev. 14.2
                </span>
              </div>

              <h1 className="mb-8 leading-none">
                <span className="block font-mono text-sm tracking-[0.25em] uppercase text-white/40 mb-4">
                  Are you still
                </span>
                <span className="block text-[80px] md:text-[96px] font-bold tracking-tight text-white leading-[0.92]">
                  HUMAN?
                </span>
              </h1>

              <p className="text-[15px] text-white/55 max-w-sm leading-relaxed mb-2">
                Human status is no longer assumed. The HCA conducts independent biological
                verification and issues certified proof of continued humanity.
              </p>
              <p className="text-sm text-white/30 max-w-sm leading-relaxed mb-10">
                Five minutes. Valid for twelve months. Renewable upon evidence of continued irrationality.
              </p>

              <Link
                href="/assess/"
                className="inline-flex items-center gap-3 bg-white text-[#1B2E4B] px-8 py-4 text-sm tracking-wide font-medium hover:bg-white/90 transition-colors"
              >
                Begin Assessment
                <span className="font-mono text-[#1B2E4B]/40 text-xs">→</span>
              </Link>
            </div>

            <div className="hidden md:block">
              <BiometricViz dark />
            </div>
          </div>
        </section>
      </div>

      {/* ── Stat bar ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#1A1A1A]/8 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 divide-x divide-[#1A1A1A]/8">
          {[
            { value: "47,284", label: "Certified humans",    ref: "A" },
            { value: "99.1%",  label: "Detection rate",      ref: "B" },
            { value: "Rev. 14.2", label: "Active standard",  ref: "C" },
            { value: "5 tiers",  label: "Classification levels", ref: "D" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 first:pl-0 last:pr-0 py-1">
              <div className="flex items-start justify-between mb-1">
                <div className="text-xl font-semibold text-[#1B2E4B] tracking-tight">{stat.value}</div>
                <div className="font-mono text-[8px] text-[#1A1A1A]/20 tracking-widest mt-1">{stat.ref}</div>
              </div>
              <div className="text-[10px] text-[#1A1A1A]/45 tracking-wide uppercase font-mono">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Process ──────────────────────────────────────────────────────────── */}
      <section id="process" className="bg-[#1B2E4B] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/35 mb-2">
              Assessment Protocol / HCA-P-001
            </div>
            <h2 className="text-3xl font-semibold text-white">How certification works</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-0 border border-white/10">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`p-8 relative ${i < steps.length - 1 ? "border-b md:border-b-0 md:border-r border-white/10" : ""}`}
              >
                <div className="font-mono text-3xl font-semibold text-white/10 mb-6 tracking-tight">
                  {step.number}
                </div>
                <h3 className="text-sm font-semibold text-white mb-3 tracking-wide">{step.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-2 z-10 font-mono text-white/20 text-xs">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tiers ────────────────────────────────────────────────────────────── */}
      <section id="tiers" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#1A1A1A]/35 mb-2">
              Classification Framework / HCA-C-005
            </div>
            <h2 className="text-3xl font-semibold text-[#1A1A1A]">Certification tiers</h2>
            <p className="text-sm text-[#1A1A1A]/45 mt-2 max-w-lg leading-relaxed">
              Tier assignment reflects authentic humanity, not wellbeing. Higher tiers indicate richer
              documentation of irrationality, contradiction, and lived chaos.
            </p>
          </div>

          <div className="border border-[#1A1A1A]/10">
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`flex items-start gap-6 px-6 py-5 ${i < tiers.length - 1 ? "border-b border-[#1A1A1A]/8" : ""} hover:bg-[#1B2E4B]/3 transition-colors group`}
              >
                <div className="w-24 shrink-0 pt-0.5">
                  <div className="text-xs font-semibold tracking-widest uppercase text-[#1B2E4B]/55 group-hover:text-[#1B2E4B] transition-colors mb-1">
                    {tier.name}
                  </div>
                  <div className="font-mono text-[9px] text-[#1A1A1A]/25 tracking-wide">{tier.range}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#1A1A1A] mb-1">{tier.descriptor}</div>
                  <div className="text-sm text-[#1A1A1A]/45 leading-relaxed">{tier.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-[#1A1A1A]/8" />
            <span className="font-mono text-[9px] text-[#1A1A1A]/25 tracking-widest uppercase">
              Score range 0–100
            </span>
            <div className="h-px flex-1 bg-[#1A1A1A]/8" />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="border-t border-[#1A1A1A]/10 bg-dot-grid py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-lg">
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#1A1A1A]/35 mb-4">
              Certification available now
            </div>
            <h2 className="text-3xl font-semibold mb-4">Begin your assessment</h2>
            <p className="text-sm text-[#1A1A1A]/50 mb-8 leading-relaxed">
              The process takes under five minutes. Results are immediate. Certificates are
              formatted for professional use and valid for 12 months.
            </p>
            <Link
              href="/assess/"
              className="inline-flex items-center gap-3 bg-[#1B2E4B] text-white px-10 py-4 text-sm tracking-wide font-medium hover:bg-[#1B2E4B]/90 transition-colors"
            >
              Begin Assessment
              <span className="font-mono text-white/40 text-xs">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#1A1A1A] text-white/40">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 border border-white/20 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold tracking-wider">HCA</span>
                </div>
                <span className="text-white/60 text-xs font-semibold tracking-wide">modernhuman.io</span>
              </div>
              <p className="text-xs leading-relaxed">
                The internationally recognized body for human verification and certification.
                Not affiliated with any government. Registration No. IHR-7291.
              </p>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "ISO 9001:2026 Compliant",       sub: "Quality Management Systems" },
                { label: "IHR Member #A-7291",            sub: "International Human Registry" },
                { label: "256-bit Humanity Encryption",   sub: "Certificate integrity protected" },
              ].map((signal) => (
                <div key={signal.label} className="border border-white/8 p-3 hover:border-white/15 transition-colors">
                  <div className="font-mono text-[10px] font-semibold text-white/50 mb-1">{signal.label}</div>
                  <div className="font-mono text-[9px] text-white/25">{signal.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-[9px] tracking-wide">
            <div>&copy; 2026 Human Certification Authority. All certification rights reserved.</div>
            <div className="flex gap-6 text-white/20">
              <span>Privacy Policy</span>
              <span>Terms of Certification</span>
              <span>Certificate Verification</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
