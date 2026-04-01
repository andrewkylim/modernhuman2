"use client";

import { useRef, useState, useEffect } from "react";

export interface DomainResult {
  score: number;
  label: string;
  analysis: string;
}

export interface AIReport {
  domains: Record<string, DomainResult>;
  modernHumanScore: number;
  overallAnalysis: string;
  certificationTier: string;
  tierDescriptor: string;
  tierRationale: string;
}

interface CertificateProps {
  name: string;
  webcamScore: number;
  drawingScore: number;
  drawingImageUrl: string;
  issuedAt: Date;
  aiReport: AIReport;
  webcamImageUrl?: string;
  dbId?: string;
}

// ─── Radar chart ─────────────────────────────────────────────────────────────

function RadarChart({ domains }: { domains: Record<string, DomainResult> }) {
  const ORDER = ["bio-sensory", "cognitive-friction", "temporal-value", "irrational-link", "motor-autonomy", "biometric-presence"];
  const cx = 110, cy = 110, maxR = 80;
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const angleFor = (i: number) => (i * 2 * Math.PI) / ORDER.length - Math.PI / 2;

  const gridPolygons = gridLevels.map((factor) => {
    const pts = ORDER.map((_, i) => {
      const a = angleFor(i);
      const r = factor * maxR;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return { pts, factor };
  });

  const scorePoints = ORDER.map((key, i) => {
    const score = domains[key]?.score ?? 0;
    const r = (score / 100) * maxR;
    const a = angleFor(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

  const scorePath = scorePoints.map((p) => `${p.x},${p.y}`).join(" ");

  const labels = ORDER.map((key, i) => {
    const a = angleFor(i);
    const lr = maxR + 22;
    return {
      x: cx + lr * Math.cos(a),
      y: cy + lr * Math.sin(a),
      label: domains[key]?.label ?? key,
    };
  });

  return (
    <svg viewBox="0 0 220 220" style={{ width: 140, height: 140, flexShrink: 0 }}>
      {/* Grid */}
      {gridPolygons.map(({ pts, factor }) => (
        <polygon key={factor} points={pts} fill="none" stroke="#1B2E4B"
          strokeWidth="0.5" opacity={0.1 + factor * 0.05} />
      ))}
      {/* Spokes */}
      {ORDER.map((_, i) => {
        const a = angleFor(i);
        return (
          <line key={i} x1={cx} y1={cy}
            x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)}
            stroke="#1B2E4B" strokeWidth="0.5" opacity="0.1" />
        );
      })}
      {/* Score fill */}
      <polygon points={scorePath} fill="#1B2E4B" fillOpacity="0.1"
        stroke="#1B2E4B" strokeWidth="1" />
      {/* Dots */}
      {scorePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="#1B2E4B" opacity="0.4" />
      ))}
      {/* Labels */}
      {labels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle"
          fontFamily="monospace" fontSize="6.5" fill="#1B2E4B" opacity="0.4" style={{ fontWeight: "bold", textTransform: "uppercase" }}>
          {l.label}
        </text>
      ))}
    </svg>
  );
}

// ─── Profile Frame Preview ───────────────────────────────────────────────────

function ProfileFramePreview({ webcamImageUrl, certificationTier, renderFn }: { 
  webcamImageUrl?: string; 
  certificationTier: string;
  renderFn: (canvas: HTMLCanvasElement) => Promise<void>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 1000; // High res internal
      canvasRef.current.height = 1000;
      renderFn(canvasRef.current);
    }
  }, [webcamImageUrl, certificationTier, renderFn]);

  return (
    <div className="relative w-[280px] h-[280px] rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-4 border-white/10 group">
      <div className="absolute inset-0 bg-[#1B2E4B] animate-pulse opacity-10" />
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block relative z-10"
      />
    </div>
  );
}

// ─── Certificate ─────────────────────────────────────────────────────────────

function generateCertNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `HCA-${seg()}-${seg()}`;
}

export default function Certificate({
  name,
  issuedAt,
  aiReport,
  webcamImageUrl,
  dbId,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [certNumber] = useState(generateCertNumber);
  const [downloading, setDownloading] = useState(false);
  const [downloadingFrame, setDownloadingFrame] = useState(false);

  const { domains, modernHumanScore, overallAnalysis, certificationTier, tierDescriptor } = aiReport;

  async function handleDownload() {
    if (!certRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certRef.current, {
        scale: 2.5,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `hca-humanity-proof-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  async function renderProfileFrame(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")!;
    const size = canvas.width;
    const center = size / 2;
    const faceRadius = size * 0.38;
    const ringRadius = size * 0.44;
    const ringWidth = size * 0.09;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Clip circle for face
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, faceRadius, 0, Math.PI * 2);
    ctx.clip();

    if (webcamImageUrl) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const s = Math.min(img.width, img.height);
          const sx = (img.width - s) / 2;
          const sy = (img.height - s) / 2;
          ctx.drawImage(img, sx, sy, s, s, center - faceRadius, center - faceRadius, faceRadius * 2, faceRadius * 2);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = webcamImageUrl!;
      });
    } else {
      ctx.fillStyle = "#1B2E4B";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.round(size * 0.05)}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("BIOMETRIC ERROR", center, center);
    }
    ctx.restore();

    // Dark Ring
    ctx.beginPath();
    ctx.arc(center, center, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "#1B2E4B";
    ctx.lineWidth = ringWidth;
    ctx.stroke();

    // Curved Text: "I AM REAL · HUMAN CERTIFIED · "
    const text = "I AM REAL · HUMAN STATUS: VERIFIED · MODERNHUMAN.IO · ";
    ctx.font = `bold ${Math.round(size * 0.026)}px monospace`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const chars = text.split("");
    const totalRotation = Math.PI * 2;
    const anglePerChar = totalRotation / chars.length;

    chars.forEach((char, i) => {
      const angle = i * anglePerChar - Math.PI / 2;
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle);
      ctx.translate(0, -ringRadius);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });

    // Tier Badge at bottom
    const badgeW = size * 0.22;
    const badgeH = size * 0.05;
    const badgeY = center + ringRadius;
    ctx.fillStyle = "#1B2E4B";
    ctx.beginPath();
    ctx.roundRect(center - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, size * 0.01);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(size * 0.028)}px monospace`;
    ctx.fillText(certificationTier.toUpperCase(), center, badgeY);
  }

  async function handleDownloadProfileFrame() {
    if (downloadingFrame) return;
    setDownloadingFrame(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1200;
      await renderProfileFrame(canvas);
      const link = document.createElement("a");
      link.download = `human-status-badge-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloadingFrame(false);
    }
  }

  const mono = { fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" as const };

  return (
    <div className="flex flex-col items-center gap-16 py-12">
      
      {/* ─── Premium Certificate ─────────────────────────────────────────── */}
      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-[#1B2E4B]/5 to-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        {/* Certificate Container */}
        <div 
          ref={certRef}
          className="relative bg-white border-[12px] border-[#1B2E4B]/5 p-1 no-overflow shadow-2xl"
          style={{ width: "100%", maxWidth: 840, aspectRatio: "1.414 / 1" }}
        >
          {/* Inner Guilloche-style border */}
          <div className="absolute inset-2 border border-[#1B2E4B]/20" />
          <div className="absolute inset-4 border-4 border-[#1B2E4B]/10" />
          
          <div className="relative h-full bg-white p-12 border border-[#1B2E4B]/5 flex flex-col justify-between">
            {/* Header Area */}
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1B2E4B] flex items-center justify-center">
                    <span className="text-white text-lg font-bold">HCA</span>
                  </div>
                  <div>
                    <h1 style={{ ...mono, fontSize: 14, fontWeight: "bold", color: "#1B2E4B", margin: 0 }}>
                      Human Certification Authority
                    </h1>
                    <p style={{ ...mono, fontSize: 8, color: "#1B2E4B", opacity: 0.4, margin: 0 }}>
                      Global Registry / Biological Origins Protocol
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div style={{ ...mono, fontSize: 10, color: "#1B2E4B", opacity: 0.3, marginBottom: 4 }}>RECORD_ID / {dbId?.slice(0, 8)}</div>
                <div style={{ ...mono, fontSize: 12, fontWeight: "extrabold", color: "#1B2E4B" }}>{certNumber}</div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#1B2E4B]/40 mb-4 font-bold italic">
                 Official Humanity Validation
              </div>
              <h2 className="text-5xl font-extrabold text-[#1B2E4B] tracking-tight mb-2">
                {name}
              </h2>
              <div className="w-48 h-0.5 bg-[#1B2E4B]/10 mx-auto mb-8" />
              
              <p className="max-w-2xl text-[13px] leading-loose text-[#1B2E4B] font-serif italic mb-10 px-10">
                &ldquo;{overallAnalysis}&rdquo;
              </p>

              <div className="flex justify-center gap-16 w-full">
                <div className="flex flex-col items-center">
                  <RadarChart domains={domains} />
                </div>
                <div className="flex flex-col justify-center items-start space-y-6">
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-widest text-[#1B2E4B]/30 mb-1">Modern Human Score</div>
                    <div className="text-3xl font-bold text-[#1B2E4B] font-mono leading-none">
                      {modernHumanScore}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-widest text-[#1B2E4B]/30 mb-1">Humanity Index Tier</div>
                    <div className="text-xl font-bold text-[#1B2E4B] uppercase tracking-tighter">
                      {certificationTier}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Area */}
            <div className="flex justify-between items-end pt-8 border-t border-[#1B2E4B]/5">
              <div className="space-y-4">
                <div className="flex gap-8">
                  <div>
                    <span style={{ ...mono, fontSize: 7, color: "#1B2E4B", opacity: 0.3, display: "block", marginBottom: 2 }}>STATUS</span>
                    <span style={{ ...mono, fontSize: 9, color: "#059669", fontWeight: "bold" }}>BIOMETRICALLY VERIFIED</span>
                  </div>
                  <div>
                    <span style={{ ...mono, fontSize: 7, color: "#1B2E4B", opacity: 0.3, display: "block", marginBottom: 2 }}>AUTHENTICITY</span>
                    <span style={{ ...mono, fontSize: 9, color: "#1B2E4B", fontWeight: "bold" }}>HARD PROOF CAPTURE</span>
                  </div>
                </div>
                <div style={{ ...mono, fontSize: 9, color: "#1B2E4B", opacity: 0.4 }}>Issued on {issuedAt.toLocaleDateString()} / valid 12 months</div>
              </div>
              
              {/* Seal */}
              <div className="relative w-24 h-24 opacity-80">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#1B2E4B]/10 animate-spin-slow">
                  <path id="sealPath" fill="none" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                  <text className="font-bold uppercase tracking-widest fill-current" fontSize="6">
                    <textPath xlinkHref="#sealPath" startOffset="0%">CERTIFIED HUMANITY AUTHORIZED PROTOCOL • </textPath>
                  </text>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 border-2 border-[#1B2E4B]/20 rounded-full flex items-center justify-center">
                      <span style={{ ...mono, fontSize: 10, fontWeight: "bold", color: "#1B2E4B" }}>HCA</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Ghost Watermark */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.015] flex items-center justify-center overflow-hidden">
               <div className="text-[180px] font-bold font-mono tracking-tighter leading-none select-none uppercase -rotate-12 translate-x-12 translate-y-12">I AM REAL</div>
            </div>
          </div>
        </div>

        {/* Download Action */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="group relative bg-[#1B2E4B] text-white px-12 py-5 text-xs font-bold tracking-[0.3em] uppercase transition-all hover:scale-[1.02] shadow-2xl overflow-hidden disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center gap-4">
              {downloading ? "Generating..." : "Download Official Proof"}
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* ─── Profile Frame Kit ─────────────────────────────────────────── */}
      <div className="w-full max-w-4xl bg-white border border-[#1A1A1A]/5 shadow-xl p-12 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none font-mono text-[80px] font-bold leading-none rotate-12">BADGE</div>
         
         <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="shrink-0">
               <ProfileFramePreview 
                  webcamImageUrl={webcamImageUrl}
                  certificationTier={certificationTier}
                  renderFn={renderProfileFrame}
               />
            </div>
            
            <div className="flex-1 space-y-8 text-center lg:text-left">
               <div>
                  <div className="font-mono text-[10px] tracking-[0.25em] mb-3 text-[#1B2E4B]/40 uppercase font-bold">Social Evidence protocol</div>
                  <h3 className="text-3xl font-bold text-[#1B2E4B] tracking-tight">I AM REAL / LinkedIn Status</h3>
                  <p className="text-sm text-[#1A1A1A]/50 leading-relaxed font-serif italic mt-4">
                    Download your high-resolution humanity badge. Optimized for professional networks to signal biological authenticity in a synthetic labor pool.
                  </p>
               </div>
               
               <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button 
                    onClick={handleDownloadProfileFrame}
                    disabled={downloadingFrame}
                    className="bg-[#1B2E4B] text-white px-8 py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-[#1B2E4B]/90 transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                    {downloadingFrame ? "Creating..." : "Download Status Badge"}
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
               </div>
               
               <div className="pt-6 flex items-center justify-center lg:justify-start gap-4">
                  <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-[#1B2E4B]/10 flex items-center justify-center overflow-hidden">
                           <span className="text-[6px] font-mono font-bold text-[#1B2E4B]/20">H</span>
                        </div>
                     ))}
                  </div>
                  <span className="text-[10px] font-mono text-[#1A1A1A]/30 uppercase tracking-widest">
                     Part of the Collective Human Defense Registry
                  </span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
