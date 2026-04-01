"use client";

import { useRef, useState } from "react";

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
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [certNumber] = useState(generateCertNumber);
  const [downloading, setDownloading] = useState(false);
  const [downloadingFrame, setDownloadingFrame] = useState(false);
  const [copied, setCopied] = useState(false);

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

  async function handleDownloadProfileFrame() {
    if (downloadingFrame) return;
    setDownloadingFrame(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 400);

      // Clip circle for face
      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 200, 162, 0, Math.PI * 2);
      ctx.clip();

      if (webcamImageUrl) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const size = Math.min(img.width, img.height);
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, 200 - 162, 200 - 162, 324, 324);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = webcamImageUrl!;
        });
      } else {
        ctx.fillStyle = "#1B2E4B";
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("NO FACE CAPTURED", 200, 200);
      }

      ctx.restore();

      // Ring
      ctx.beginPath();
      ctx.arc(200, 200, 183, 0, Math.PI * 2);
      ctx.strokeStyle = "#1B2E4B";
      ctx.lineWidth = 34;
      ctx.stroke();

      // Curved text around ring
      const text = "HUMAN CERTIFIED · MODERNHUMAN.IO";
      const anglePerChar = (Math.PI * 2) / text.length;
      const startAngle = -Math.PI / 2;
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < text.length; i++) {
        const angle = startAngle + i * anglePerChar;
        ctx.save();
        ctx.translate(200, 200);
        ctx.rotate(angle);
        ctx.translate(0, -183);
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }

      // Badge pill at bottom (~270deg = bottom of ring)
      const badgeText = certificationTier.toUpperCase();
      const badgeAngle = Math.PI / 2; // 90deg = bottom
      const badgeCx = 200 + 183 * Math.cos(badgeAngle);
      const badgeCy = 200 + 183 * Math.sin(badgeAngle);
      const badgeW = 72;
      const badgeH = 18;
      ctx.fillStyle = "#1B2E4B";
      ctx.beginPath();
      ctx.roundRect(badgeCx - badgeW / 2, badgeCy - badgeH / 2, badgeW, badgeH, 9);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(badgeText, badgeCx, badgeCy);

      const link = document.createElement("a");
      link.download = `profile-frame-${certNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloadingFrame(false);
    }
  }

  function handleShareX() {
    const tweet = `Just got certified human. ${certificationTier} tier. Modern Human Score: ${modernHumanScore}/1000. modernhuman.io/assess`;
    window.open(
      "https://twitter.com/intent/tweet?text=" + encodeURIComponent(tweet),
      "_blank"
    );
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText("https://modernhuman.io/assess");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}>

      {/* ── Certificate document ────────────────────────────────────────────── */}
      <div ref={certRef} style={certStyle}>

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
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start",
          borderTop: "1px solid #e0ddd5", borderBottom: "1px solid #e0ddd5",
          padding: "16px 0", marginBottom: 18 }}>

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
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginBottom: 20 }}>

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

          <div style={{ display: "flex", gap: 40, marginLeft: "auto" }}>
            {[
              { sig: "A. Turing", name: "Dr. A. Turing", title: "Chief Humanity Officer" },
              { sig: "The Board", name: "The Board of", title: "Human Standards" },
            ].map(({ sig, name: sn, title }) => (
              <div key={sn} style={{ textAlign: "center" }}>
                <div style={{ borderBottom: "1px solid #555", width: 140,
                  paddingBottom: 2, marginBottom: 3 }}>
                  <p style={{ fontFamily: "'Brush Script MT', cursive, Georgia, serif",
                    fontSize: 20, color: "#1a2744", margin: 0, fontStyle: "italic",
                    lineHeight: 1.4 }}>
                    {sig}
                  </p>
                </div>
                <p style={{ ...mono, fontSize: 9, color: "#666", margin: 0 }}>{sn}</p>
                <p style={{ ...mono, fontSize: 9, color: "#666", margin: 0 }}>{title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", borderTop: "1px solid #e0ddd5", paddingTop: 10 }}>
          <p style={{ ...mono, fontSize: 9, color: "#888", margin: "0 0 3px" }}>
            Issued: {formatDate(issuedAt)} · Valid for 1 year from date of issue
          </p>
          <p style={{ ...mono, fontSize: 8, color: "#bbb", margin: 0 }}>
            This certificate is issued by the Human Certification Authority and certifies the above
            individual as human pending annual re-evaluation. Verification at modernhuman.io.
          </p>
        </div>
      </div>

      {/* ── Domain analysis cards (outside the certificate) ─────────────────── */}
      <div style={{ width: "100%", maxWidth: 720 }}>
        <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.2em",
          textTransform: "uppercase", color: "#1A1A1A", opacity: 0.4, marginBottom: 12 }}>
          Domain Analysis
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {DOMAIN_ORDER.map((key) => {
            const d = domains[key];
            if (!d) return null;
            return (
              <div key={key} style={{ border: "1px solid rgba(26,26,26,0.1)",
                padding: "12px 14px", backgroundColor: "#FAFAF8" }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 9,
                    textTransform: "uppercase", letterSpacing: "0.15em",
                    color: "#1B2E4B", fontWeight: "bold" }}>
                    {d.label}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: 11,
                    color: "#1A1A1A", opacity: 0.6 }}>
                    {d.score}/100
                  </span>
                </div>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 12,
                  color: "#1A1A1A", opacity: 0.65, lineHeight: 1.6,
                  margin: 0, fontStyle: "italic" }}>
                  {d.analysis}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="font-mono text-xs tracking-widest uppercase border border-gray-800 px-8 py-3 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {downloading ? "Generating..." : "Download Certificate"}
        </button>

        <button
          onClick={handleDownloadProfileFrame}
          disabled={downloadingFrame}
          className="font-mono text-xs tracking-widest uppercase border border-gray-800 px-8 py-3 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {downloadingFrame ? "Creating..." : "Download Profile Frame"}
        </button>

        <button
          onClick={handleShareX}
          className="font-mono text-xs tracking-widest uppercase border border-gray-800 px-8 py-3 hover:bg-gray-900 hover:text-white transition-colors"
        >
          Share on X
        </button>

        <button
          onClick={handleCopyLink}
          className="font-mono text-xs tracking-widest uppercase border border-gray-800 px-8 py-3 hover:bg-gray-900 hover:text-white transition-colors min-w-[140px]"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
