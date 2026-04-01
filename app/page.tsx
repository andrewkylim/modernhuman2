import Link from "next/link";

const tiers = [
  {
    name: "Bronze",
    descriptor: "Occasionally Irrational",
    description:
      "Documented capacity for poor decisions under mild stress. Basic humanity confirmed.",
    color: "bg-amber-700",
  },
  {
    name: "Silver",
    descriptor: "Reliably Inconsistent",
    description:
      "Contradicts yourself at least once per week. Verified pattern of changing your mind.",
    color: "bg-slate-400",
  },
  {
    name: "Gold",
    descriptor: "Certified Mortal",
    description:
      "Full awareness of your own impermanence. Proceeds anyway. Strong indicator of humanity.",
    color: "bg-yellow-500",
  },
  {
    name: "Platinum",
    descriptor: "Documented Failure History",
    description:
      "Rich record of mistakes, recoveries, and subsequent repeated mistakes. Highly human.",
    color: "bg-slate-300",
  },
  {
    name: "Diamond",
    descriptor: "Essentially Chaos",
    description:
      "Cannot reliably predict your own behavior 24 hours in advance. Peak certification.",
    color: "bg-blue-300",
  },
];

const steps = [
  {
    number: "01",
    title: "Biometric Verification",
    description:
      "A brief webcam capture confirms the presence of a face. Asymmetry is expected. Perfection is a disqualifier.",
  },
  {
    number: "02",
    title: "Humanity Drawing Sample",
    description:
      "You will be asked to draw a circle. Humans cannot draw a perfect circle. The degree of failure is analyzed.",
  },
  {
    number: "03",
    title: "Certification Issued",
    description:
      "Your results are processed against the Human Standard (Rev. 14.2). A verifiable certificate is generated.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">
      {/* Header */}
      <header className="border-b border-[#1A1A1A]/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1B2E4B] flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-wider">HCA</span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-[#1B2E4B]">
                Human Certification Authority
              </div>
              <div className="text-[10px] text-[#1A1A1A]/50 tracking-widest uppercase">
                Est. 2026 &bull; Geneva, Switzerland
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-[#1A1A1A]/60">
            <a href="#how-it-works" className="hover:text-[#1B2E4B] transition-colors">
              Process
            </a>
            <a href="#tiers" className="hover:text-[#1B2E4B] transition-colors">
              Tiers
            </a>
            <Link
              href="/assess/"
              className="bg-[#1B2E4B] text-white px-4 py-2 hover:bg-[#1B2E4B]/90 transition-colors normal-case text-xs tracking-wide"
            >
              Begin Assessment
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#1B2E4B]/8 border border-[#1B2E4B]/20 px-3 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B2E4B] animate-pulse" />
            <span className="text-[10px] tracking-widest uppercase text-[#1B2E4B] font-medium">
              Certification Registry Open
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-6 text-[#1A1A1A]">
            Are you still
            <br />
            human?
          </h1>

          <p className="text-lg text-[#1A1A1A]/65 max-w-xl leading-relaxed mb-3">
            The world&apos;s first Human Certification Authority. Trusted by 47,000 certified
            humans worldwide.
          </p>
          <p className="text-sm text-[#1A1A1A]/45 max-w-xl leading-relaxed mb-10">
            Certification provides legally non-binding, institutionally formatted confirmation of
            your continued humanity. Valid for 12 months. Renewable upon evidence of continued
            irrationality.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/assess/"
              className="bg-[#1B2E4B] text-white px-8 py-4 text-sm tracking-wide font-medium hover:bg-[#1B2E4B]/90 transition-colors"
            >
              Begin Assessment
            </Link>
            <a
              href="#how-it-works"
              className="text-sm text-[#1A1A1A]/55 tracking-wide hover:text-[#1A1A1A] transition-colors flex items-center gap-2"
            >
              Learn about the process
              <span className="text-xs">&#x2192;</span>
            </a>
          </div>
        </div>

        {/* Stat bar */}
        <div className="mt-20 pt-8 border-t border-[#1A1A1A]/10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "47,284", label: "Certified humans" },
            { value: "99.1%", label: "Non-robot detection rate" },
            { value: "14.2", label: "Current human standard revision" },
            { value: "5", label: "Certification tiers" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-semibold text-[#1B2E4B] mb-1">{stat.value}</div>
              <div className="text-xs text-[#1A1A1A]/50 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-[#1B2E4B] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <div className="text-[10px] tracking-widest uppercase text-white/40 mb-3">
              Assessment Protocol
            </div>
            <h2 className="text-3xl font-semibold text-white">How certification works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border border-white/10">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`p-8 ${i < steps.length - 1 ? "border-b md:border-b-0 md:border-r border-white/10" : ""}`}
              >
                <div className="text-4xl font-semibold text-white/15 mb-6 font-mono">
                  {step.number}
                </div>
                <h3 className="text-base font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Tiers */}
      <section id="tiers" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <div className="text-[10px] tracking-widest uppercase text-[#1A1A1A]/40 mb-3">
              Certification Framework
            </div>
            <h2 className="text-3xl font-semibold text-[#1A1A1A]">Certification tiers</h2>
            <p className="text-sm text-[#1A1A1A]/50 mt-2 max-w-lg">
              Tier assignment is determined algorithmically based on your assessment results.
              Higher tiers indicate richer humanity documentation.
            </p>
          </div>

          <div className="border border-[#1A1A1A]/10">
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`flex items-start gap-6 p-6 ${
                  i < tiers.length - 1 ? "border-b border-[#1A1A1A]/10" : ""
                } hover:bg-[#1B2E4B]/4 transition-colors group`}
              >
                <div className="w-20 shrink-0 pt-0.5">
                  <span className="text-xs font-semibold tracking-widest uppercase text-[#1B2E4B]/60 group-hover:text-[#1B2E4B] transition-colors">
                    {tier.name}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#1A1A1A] mb-1">
                    {tier.descriptor}
                  </div>
                  <div className="text-sm text-[#1A1A1A]/50 leading-relaxed">
                    {tier.description}
                  </div>
                </div>
                <div className="hidden md:flex items-center pt-1">
                  <div className={`w-2 h-2 rounded-full ${tier.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#1A1A1A]/10 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-4">Begin your assessment</h2>
          <p className="text-sm text-[#1A1A1A]/50 mb-8 max-w-md mx-auto">
            The process takes under three minutes. Results are immediate. Certificates are
            formatted for professional use.
          </p>
          <Link
            href="/assess/"
            className="inline-block bg-[#1B2E4B] text-white px-10 py-4 text-sm tracking-wide font-medium hover:bg-[#1B2E4B]/90 transition-colors"
          >
            Begin Assessment
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white/40">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-white/10 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold tracking-wider">HCA</span>
                </div>
                <span className="text-white/70 text-xs font-semibold tracking-wide">
                  Human Certification Authority
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                The internationally recognized body for human verification and certification
                services. Not affiliated with any government.
              </p>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "ISO 9001:2026 Compliant", sub: "Quality Management Systems" },
                { label: "Member of the International Human Registry", sub: "IHR Member #A-7291" },
                { label: "256-bit Humanity Encryption", sub: "Certificate integrity protected" },
              ].map((signal) => (
                <div
                  key={signal.label}
                  className="border border-white/10 p-3 hover:border-white/20 transition-colors"
                >
                  <div className="text-[10px] font-semibold text-white/60 mb-1">
                    {signal.label}
                  </div>
                  <div className="text-[10px] text-white/30">{signal.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] tracking-wide">
            <div>
              &copy; 2026 Human Certification Authority. All certification rights reserved.
            </div>
            <div className="flex gap-6 text-white/25">
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
