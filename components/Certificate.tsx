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
  const ORDER = ["body", "mind", "purpose", "connection", "growth", "security"];
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
      score: domains[key]?.score ?? 0,
    };
  });

  return (
    <svg viewBox="0 0 220 220" style={{ width: 180, height: 180, flexShrink: 0 }}>
      {/* Grid */}
      {gridPolygons.map(({ pts, factor }) => (
        <polygon key={factor} points={pts} fill="none" stroke="#1a2744"
          strokeWidth="0.5" opacity={0.08 + factor * 0.1} />
      ))}
      {/* Spokes */}
      {ORDER.map((_, i) => {
        const a = angleFor(i);
        return (
          <line key={i} x1={cx} y1={cy}
            x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)}
            stroke="#1a2744" strokeWidth="0.5" opacity="0.15" />
        );
      })}
      {/* Score fill */}
      <polygon points={scorePath} fill="#1a2744" fillOpacity="0.1"
        stroke="#1a2744" strokeWidth="1.5" />
      {/* Dots */}
      {scorePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#1a2744" opacity="0.6" />
      ))}
      {/* Labels */}
      {labels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle"
          fontFamily="monospace" fontSize="7.5" fill="#1a2744" opacity="0.55">
          {l.label}
        </text>
      ))}
    </svg>
  );
}

// ─── Tier badge ───────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  Bronze:   "#92400e",
  Silver:   "#374151",
  Gold:     "#92400e",
  Platinum: "#374151",
  Diamond:  "#1a2744",
};

function ProfileFramePreview({ webcamImageUrl, certificationTier, renderFn }: { 
  webcamImageUrl?: string; 
  certificationTier: string;
  renderFn: (canvas: HTMLCanvasElement) => Promise<void>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 400;
      canvasRef.current.height = 400;
      renderFn(canvasRef.current);
    }
  }, [webcamImageUrl, certificationTier, renderFn]);

  return (
    <div style={{ position: "relative", width: 180, height: 180, borderRadius: "50%", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
      <canvas 
        ref={canvasRef} 
        style={{ width: "100%", height: "100%", display: "block" }}
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

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function Certificate({
  name,
  webcamScore,
  drawingScore,
  drawingImageUrl,
  issuedAt,
  aiReport,
  webcamImageUrl,
  dbId,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [certNumber] = useState(generateCertNumber);
  const [downloading, setDownloading] = useState(false);
  const [downloadingFrame, setDownloadingFrame] = useState(false);

  const { domains, modernHumanScore, overallAnalysis, certificationTier,
    tierDescriptor, tierRationale } = aiReport;

  const DOMAIN_ORDER = ["body", "mind", "purpose", "connection", "growth", "security"];

  async function handleDownload() {
    if (!certRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: "#FFFDF5",
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `humanity-certificate-${certNumber}.png`;
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
    const ringRadius = size * 0.4575; // 183/400 ratio
    const faceRadius = size * 0.405;   // 162/400 ratio
    const ringWidth = size * 0.085;    // 34/400 ratio

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
      ctx.font = `bold ${Math.round(size * 0.035)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("NO FACE CAPTURED", center, center);
    }

    ctx.restore();

    // Ring
    ctx.beginPath();
    ctx.arc(center, center, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "#1B2E4B";
    ctx.lineWidth = ringWidth;
    ctx.stroke();

    // Curved text around ring
    const text = "HUMAN CERTIFIED · MODERNHUMAN.IO";
    const anglePerChar = (Math.PI * 2) / text.length;
    const startAngle = -Math.PI / 2;
    ctx.font = `bold ${Math.round(size * 0.0275)}px monospace`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < text.length; i++) {
      const angle = startAngle + i * anglePerChar;
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle);
      ctx.translate(0, -ringRadius);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    // Badge pill at bottom
    const badgeText = certificationTier.toUpperCase();
    const badgeAngle = Math.PI / 2;
    const badgeCx = center + ringRadius * Math.cos(badgeAngle);
    const badgeCy = center + ringRadius * Math.sin(badgeAngle);
    const badgeW = size * 0.18;
    const badgeH = size * 0.045;
    ctx.fillStyle = "#1B2E4B";
    ctx.beginPath();
    ctx.roundRect(badgeCx - badgeW / 2, badgeCy - badgeH / 2, badgeW, badgeH, Math.round(size * 0.0225));
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(size * 0.025)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, badgeCx, badgeCy);
  }

  async function handleDownloadProfileFrame() {
    if (downloadingFrame) return;
    setDownloadingFrame(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 800;
      await renderProfileFrame(canvas);

      const link = document.createElement("a");
      link.download = `profile-frame-${certNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloadingFrame(false);
    }
  }

  // Not used anymore as sharing buttons are removed
  // function handleShareX() { ... }
  // async function handleCopyLink() { ... }

  const certStyle: React.CSSProperties = {
    backgroundColor: "#FFFDF5",
    border: "6px double #1a2744",
    padding: "36px 44px",
    maxWidth: 720,
    width: "100%",
    fontFamily: "Georgia, 'Times New Roman', serif",
    color: "#1a1a1a",
    position: "relative",
    boxSizing: "border-box",
  };

  const mono: React.CSSProperties = { fontFamily: "monospace" };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%", paddingBottom: 60 }}>

      {/* ── Certificate document (with mobile scale-to-fit) ────────────────── */}
      <div className="w-full flex justify-center overflow-hidden py-4">
        <div 
          ref={certRef} 
          style={certStyle}
          className="origin-top sm:scale-100 scale-[0.65] xs:scale-[0.8] mb-[-120px] xs:mb-[-60px] sm:mb-0"
        >

        {/* Corner ornaments */}
        {(["tl","tr","bl","br"] as const).map((pos) => (
          <div key={pos} style={{
            position: "absolute",
            width: 18, height: 18,
            top: pos.startsWith("t") ? 12 : undefined,
            bottom: pos.startsWith("b") ? 12 : undefined,
            left: pos.endsWith("l") ? 12 : undefined,
            right: pos.endsWith("r") ? 12 : undefined,
            borderTop: pos.startsWith("t") ? "2px solid #1a2744" : undefined,
            borderBottom: pos.startsWith("b") ? "2px solid #1a2744" : undefined,
            borderLeft: pos.endsWith("l") ? "2px solid #1a2744" : undefined,
            borderRight: pos.endsWith("r") ? "2px solid #1a2744" : undefined,
          }} />
        ))}

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ ...mono, fontSize: 9, letterSpacing: "0.3em", color: "#999",
            textTransform: "uppercase", margin: "0 0 8px" }}>
            Established 2026 · Registration No. IHR-7291
          </p>
          <h1 style={{ fontSize: 18, fontWeight: "bold", letterSpacing: "0.08em",
            color: "#1a2744", textTransform: "uppercase", margin: "0 0 6px" }}>
            MODERNHUMAN.IO
          </h1>
          <div style={{ width: "100%", height: 1, backgroundColor: "#1a2744", margin: "0 0 5px" }} />
          <h2 style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: "#1a2744",
            textTransform: "uppercase", margin: 0, fontWeight: "normal" }}>
            HUMAN CERTIFICATION AUTHORITY
          </h2>
          <div style={{ width: "100%", height: 1, backgroundColor: "#1a2744", marginTop: 5 }} />
        </div>

        {/* Cert number */}
        <p style={{ ...mono, fontSize: 9, color: "#bbb", textAlign: "right",
          margin: "0 0 16px", letterSpacing: "0.05em" }}>
          CERT. NO. {certNumber}
        </p>

        {/* Recipient */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#777",
          fontStyle: "italic", margin: "0 0 6px" }}>
          This certifies that
        </p>
        <p style={{ textAlign: "center", fontSize: 28, fontWeight: "bold",
          color: "#1a2744", borderBottom: "1px solid #1a2744",
          paddingBottom: 8, margin: "0 0 16px", letterSpacing: "0.02em" }}>
          {name}
        </p>

        {/* Scores row */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <p style={{ ...mono, fontSize: 9, textTransform: "uppercase",
              letterSpacing: "0.2em", color: "#888", margin: "0 0 4px" }}>
              Modern Human Score
            </p>
            <p style={{ fontSize: 38, fontWeight: "bold", color: "#1a2744",
              margin: 0, lineHeight: 1, fontFamily: "monospace" }}>
              {modernHumanScore}
              <span style={{ fontSize: 16, color: "#aaa", fontWeight: "normal" }}> /1000</span>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ ...mono, fontSize: 9, textTransform: "uppercase",
              letterSpacing: "0.2em", color: "#888", margin: "0 0 4px" }}>
              Certification Tier
            </p>
            <p style={{ fontSize: 18, fontWeight: "bold", margin: 0,
              color: TIER_COLORS[certificationTier] || "#1a2744" }}>
              {certificationTier}
            </p>
            <p style={{ fontStyle: "italic", fontSize: 13, color: "#666", margin: "2px 0 0" }}>
              {tierDescriptor}
            </p>
          </div>
        </div>

        {/* Domain breakdown */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-10 items-center md:items-start border-t border-[#e0ddd5] border-b border-[#e0ddd5] py-4 mb-4">

          {/* Radar */}
          <RadarChart domains={domains} />

          {/* Domain bars */}
          <div style={{ flex: 1 }}>
            <p style={{ ...mono, fontSize: 9, fontWeight: "bold",
              textTransform: "uppercase", letterSpacing: "0.15em",
              color: "#555", margin: "0 0 10px" }}>
              Domain Breakdown
            </p>
            {DOMAIN_ORDER.map((key) => {
              const d = domains[key];
              if (!d) return null;
              return (
                <div key={key} style={{ marginBottom: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ ...mono, fontSize: 9, textTransform: "uppercase",
                      letterSpacing: "0.1em", color: "#666" }}>
                      {d.label}
                    </span>
                    <span style={{ ...mono, fontSize: 9, color: "#888" }}>
                      {d.score}/100
                    </span>
                  </div>
                  <div style={{ height: 3, backgroundColor: "#e8e5de", borderRadius: 2 }}>
                    <div style={{
                      height: "100%",
                      width: `${d.score}%`,
                      backgroundColor: "#1a2744",
                      borderRadius: 2,
                      opacity: 0.5 + d.score / 200,
                    }} />
                  </div>
                </div>
              );
            })}

            {/* Biometric sub-scores */}
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed #ddd" }}>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { label: "Biometric Scan", score: webcamScore },
                  { label: "Drawing Sample", score: drawingScore },
                ].map((item) => (
                  <div key={item.label}>
                    <span style={{ ...mono, fontSize: 8, textTransform: "uppercase",
                      letterSpacing: "0.1em", color: "#aaa" }}>
                      {item.label}
                    </span>
                    <span style={{ ...mono, fontSize: 9, color: "#888", marginLeft: 6 }}>
                      {item.score}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overall analysis */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ ...mono, fontSize: 9, fontWeight: "bold", textTransform: "uppercase",
            letterSpacing: "0.15em", color: "#555", margin: "0 0 8px" }}>
            Assessment Summary
          </p>
          <p style={{ fontSize: 12, color: "#444", lineHeight: 1.7, margin: "0 0 6px",
            fontStyle: "italic" }}>
            &ldquo;{overallAnalysis}&rdquo;
          </p>
          <p style={{ ...mono, fontSize: 9, color: "#aaa", margin: 0 }}>
            Tier rationale: {tierRationale}
          </p>
        </div>

        {/* Drawing thumbnail + signatures */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 sm:gap-0 mb-5">

          {drawingImageUrl && (
            <div style={{ textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={drawingImageUrl} alt="Drawing sample"
                style={{ width: 80, height: 60, border: "1px solid #ddd",
                  display: "block", objectFit: "contain", backgroundColor: "#fff" }} />
              <p style={{ ...mono, fontSize: 8, color: "#bbb", marginTop: 3,
                textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Drawing sample
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-center sm:items-end">
            {[
              { sig: "A. Turing", name: "Dr. A. Turing", title: "Chief Humanity Officer" },
              { sig: "The Board", name: "The Board of", title: "Human Standards" },
            ].map(({ sig, name: sn, title }) => (
              <div key={sn} style={{ textAlign: "center" }}>
                <div style={{ borderBottom: "1px solid #555", width: 120,
                  paddingBottom: 2, marginBottom: 3 }}>
                  <p style={{ fontFamily: "'Brush Script MT', cursive, Georgia, serif",
                    fontSize: 20, color: "#1a2744", margin: 0, fontStyle: "italic",
                    lineHeight: 1.4 }}>
                    {sig}
                  </p>
                </div>
                <p style={{ ...mono, fontSize: 8, color: "#666", margin: 0 }}>{sn}</p>
                <p style={{ ...mono, fontSize: 8, color: "#666", margin: 0 }}>{title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", borderTop: "1px solid #e0ddd5", paddingTop: 10 }}>
          <p style={{ ...mono, fontSize: 8, color: "#888", margin: "0 0 3px" }}>
            Issued: {formatDate(issuedAt)} · Valid for 1 year from date of issue
          </p>
          {dbId && (
            <p style={{ ...mono, fontSize: 8, color: "#1B2E4B", margin: "4px 0", fontWeight: "bold" }}>
              REGISTERED DOSSIER ID: {dbId}
            </p>
          )}
          <p style={{ ...mono, fontSize: 8, color: "#bbb", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            MODERNHUMAN.IO / HUMAN CERTIFICATION AUTHORITY
          </p>
        </div>
      </div>
    </div>

      {/* ── Digital Assets Kit ────────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 720, backgroundColor: "#1B2E4B", padding: "40px 30px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4 }}>
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.25em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", margin: "0 0 10px" }}>
            Certified Human Assets
          </h3>
          <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
            Claim your humanity dossier.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* LinkedIn Frame Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: 24, display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
               <ProfileFramePreview 
                 webcamImageUrl={webcamImageUrl} 
                 certificationTier={certificationTier} 
                 renderFn={renderProfileFrame}
               />
            </div>
            <div>
              <h4 style={{ color: "#ffffff", fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>Biometric Profile Frame</h4>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, lineHeight: 1.6, marginBottom: 16 }}>
                A biological identity overlay for social profiles. Signals verified status to high-fidelity networks.
              </p>
              <button
                onClick={handleDownloadProfileFrame}
                disabled={downloadingFrame}
                className="font-mono text-[9px] tracking-widest uppercase border border-white/20 text-white px-6 py-3 hover:bg-white hover:text-[#1B2E4B] transition-colors disabled:opacity-40 w-full"
              >
                {downloadingFrame ? "Creating..." : "Download Profile Badge"}
              </button>
            </div>
          </div>

          {/* Certificate Thumbnail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: 24, display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }} onClick={handleDownload}>
              <div style={{ width: 110, height: 140, backgroundColor: "#FFFDF5", border: "1px solid rgba(255,255,255,0.2)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", padding: 8, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
                 <div style={{ width: "100%", height: 1.5, background: "#1B2E4B", marginBottom: 3 }} />
                 <div style={{ fontSize: 3.5, fontWeight: "bold", color: "#1B2E4B", textAlign: "center", marginBottom: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>HCA REGISTRY</div>
                 <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: "bold", color: "#1B2E4B", textAlign: "center" }}>
                     <div style={{ fontSize: 4, fontWeight: "normal", opacity: 0.5 }}>SCORE</div>
                     {modernHumanScore}
                   </div>
                 </div>
                 <div style={{ fontSize: 3, color: "#1B2E4B", textAlign: "center", padding: "2px 4px", borderTop: "0.5px solid #1B2E4B", width: "100%", textTransform: "uppercase" }}>Proof of Biological Origin</div>
                 <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(255,255,255,0.1), transparent)" }} />
              </div>
            </div>
            <div>
              <h4 style={{ color: "#ffffff", fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>Full Humanity Record</h4>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, lineHeight: 1.6, marginBottom: 16 }}>
                High-resolution institutional record for official identity verification. Matches global registry node data.
              </p>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="font-mono text-[9px] tracking-widest uppercase border border-white/20 text-white px-6 py-3 hover:bg-white hover:text-[#1B2E4B] transition-colors disabled:opacity-40 w-full"
              >
                {downloading ? "Generating..." : "Download Full Record"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Domain analysis cards ────────────────────────────────────────────── */}
      <div className="w-full max-w-[720px] px-6 md:px-0">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A]/40 mb-3">
          Deep-Layer Protocol Analysis
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DOMAIN_ORDER.map((key) => {
            const d = domains[key];
            if (!d) return null;
            return (
              <div key={key} className="border border-[#1A1A1A]/10 p-3 md:p-4 bg-[#FAFAF8]">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#1B2E4B] font-bold">
                    {d.label}
                  </span>
                  <span className="font-mono text-[11px] text-[#1A1A1A]/60">
                    {d.score}/100
                  </span>
                </div>
                <p className="font-serif text-[12px] text-[#1A1A1A]/65 leading-relaxed italic">
                  {d.analysis}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
