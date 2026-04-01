"use client";

import { useRef, useState } from "react";

interface CertificateProps {
  name: string;
  questionScore: number;
  webcamScore: number;
  drawingScore: number;
  drawingImageUrl: string;
  issuedAt: Date;
}

interface Tier {
  name: string;
  descriptor: string;
}

function getTier(score: number): Tier {
  if (score <= 20) return { name: "Bronze", descriptor: "Occasionally Irrational" };
  if (score <= 40) return { name: "Silver", descriptor: "Reliably Inconsistent" };
  if (score <= 60) return { name: "Gold", descriptor: "Certified Mortal" };
  if (score <= 80) return { name: "Platinum", descriptor: "Documented Failure History" };
  return { name: "Diamond", descriptor: "Essentially Chaos" };
}

function generateCertNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `HCA-${segment()}-${segment()}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Certificate({
  name,
  questionScore,
  webcamScore,
  drawingScore,
  drawingImageUrl,
  issuedAt,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [certNumber] = useState<string>(() => generateCertNumber());
  const [downloading, setDownloading] = useState(false);

  const overallScore = Math.round(questionScore * 0.35 + webcamScore * 0.25 + drawingScore * 0.4);
  const tier = getTier(overallScore);

  const handleDownload = async () => {
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
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Certificate document */}
      <div
        ref={certRef}
        style={{
          backgroundColor: "#FFFDF5",
          border: "6px double #1a2744",
          padding: "40px 48px",
          maxWidth: 680,
          width: "100%",
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: "#1a1a1a",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Corner ornaments */}
        {(["topLeft", "topRight", "bottomLeft", "bottomRight"] as const).map((pos) => (
          <div
            key={pos}
            style={{
              position: "absolute",
              width: 20,
              height: 20,
              top: pos.startsWith("top") ? 12 : undefined,
              bottom: pos.startsWith("bottom") ? 12 : undefined,
              left: pos.endsWith("Left") ? 12 : undefined,
              right: pos.endsWith("Right") ? 12 : undefined,
              borderTop: pos.startsWith("top") ? "2px solid #1a2744" : undefined,
              borderBottom: pos.startsWith("bottom") ? "2px solid #1a2744" : undefined,
              borderLeft: pos.endsWith("Left") ? "2px solid #1a2744" : undefined,
              borderRight: pos.endsWith("Right") ? "2px solid #1a2744" : undefined,
            }}
          />
        ))}

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              letterSpacing: "0.3em",
              color: "#888",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}
          >
            Established 2025 · Registration No. 7,204
          </p>
          <h1
            style={{
              fontSize: 20,
              fontWeight: "bold",
              letterSpacing: "0.08em",
              color: "#1a2744",
              textTransform: "uppercase",
              margin: "0 0 8px",
            }}
          >
            MODERNHUMAN.IO
          </h1>
          <div style={{ width: "100%", height: 1, backgroundColor: "#1a2744", margin: "0 0 6px" }} />
          <h2
            style={{
              fontSize: 13,
              letterSpacing: "0.2em",
              color: "#1a2744",
              textTransform: "uppercase",
              margin: "0 0 6px",
              fontWeight: "normal",
            }}
          >
            HUMAN CERTIFICATION AUTHORITY
          </h2>
          <div style={{ width: "100%", height: 1, backgroundColor: "#1a2744" }} />
        </div>

        {/* Certificate number */}
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#aaa",
            textAlign: "right",
            margin: "0 0 20px",
            letterSpacing: "0.05em",
          }}
        >
          CERT. NO. {certNumber}
        </p>

        {/* Preamble */}
        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "#666",
            fontStyle: "italic",
            margin: "0 0 10px",
          }}
        >
          This is to certify that
        </p>

        {/* Recipient name */}
        <p
          style={{
            textAlign: "center",
            fontSize: 30,
            fontWeight: "bold",
            color: "#1a2744",
            borderBottom: "1px solid #1a2744",
            paddingBottom: 10,
            margin: "0 0 18px",
            letterSpacing: "0.02em",
          }}
        >
          {name}
        </p>

        {/* Classification */}
        <div style={{ textAlign: "center", margin: "0 0 24px" }}>
          <p style={{ fontSize: 14, color: "#555", margin: "0 0 6px" }}>
            has demonstrated sufficient irregularity to qualify as
          </p>
          <p
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#1a2744",
              margin: "0 0 4px",
            }}
          >
            {tier.name} Tier
          </p>
          <p
            style={{
              fontSize: 16,
              color: "#444",
              fontStyle: "italic",
              margin: "0 0 8px",
            }}
          >
            {tier.descriptor}
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#777",
              margin: 0,
              letterSpacing: "0.05em",
            }}
          >
            HUMANITY SCORE: {overallScore} / 100
          </p>
        </div>

        {/* Assessment breakdown + drawing thumbnail */}
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
            borderTop: "1px solid #ddd",
            borderBottom: "1px solid #ddd",
            padding: "16px 0",
            margin: "0 0 28px",
          }}
        >
          {/* Score table */}
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#555",
                margin: "0 0 10px",
              }}
            >
              Assessment Summary
            </p>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#555",
                      paddingRight: 12,
                      paddingBottom: 5,
                    }}
                  >
                    Questionnaire
                  </td>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      paddingBottom: 5,
                      width: 40,
                    }}
                  >
                    {questionScore}/100
                  </td>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: "#aaa",
                      paddingBottom: 5,
                    }}
                  >
                    × 35%
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#555",
                      paddingRight: 12,
                      paddingBottom: 5,
                    }}
                  >
                    Biometric Analysis
                  </td>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      paddingBottom: 5,
                      width: 40,
                    }}
                  >
                    {webcamScore}/100
                  </td>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: "#aaa",
                      paddingBottom: 5,
                    }}
                  >
                    × 25%
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#555",
                      paddingRight: 12,
                      paddingBottom: 5,
                    }}
                  >
                    Drawing Sample
                  </td>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      paddingBottom: 5,
                    }}
                  >
                    {drawingScore}/100
                  </td>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: "#aaa",
                      paddingBottom: 5,
                    }}
                  >
                    × 40%
                  </td>
                </tr>
                <tr style={{ borderTop: "1px solid #e5e5e5" }}>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      fontWeight: "bold",
                      paddingTop: 6,
                    }}
                  >
                    Overall
                  </td>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      fontWeight: "bold",
                      paddingTop: 6,
                    }}
                  >
                    {overallScore}/100
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Drawing thumbnail */}
          {drawingImageUrl && (
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={drawingImageUrl}
                alt="Biometric Drawing Sample"
                style={{
                  width: 110,
                  height: 88,
                  border: "1px solid #ddd",
                  display: "block",
                  objectFit: "contain",
                  backgroundColor: "#fff",
                }}
              />
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  color: "#aaa",
                  marginTop: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Biometric Drawing Sample
              </p>
            </div>
          )}
        </div>

        {/* Signatures */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "0 0 28px",
            gap: 16,
          }}
        >
          {[
            { sig: "A. Turing", name: "Dr. A. Turing", title: "Chief Humanity Officer" },
            { sig: "The Board", name: "The Board of", title: "Human Standards" },
          ].map(({ sig, name: sigName, title }) => (
            <div key={sigName} style={{ textAlign: "center" }}>
              <div
                style={{
                  borderBottom: "1px solid #555",
                  width: 160,
                  paddingBottom: 2,
                  marginBottom: 4,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Brush Script MT', cursive, Georgia, serif",
                    fontSize: 22,
                    color: "#1a2744",
                    margin: 0,
                    fontStyle: "italic",
                    lineHeight: 1.4,
                  }}
                >
                  {sig}
                </p>
              </div>
              <p style={{ fontFamily: "monospace", fontSize: 10, color: "#666", margin: 0 }}>
                {sigName}
              </p>
              <p style={{ fontFamily: "monospace", fontSize: 10, color: "#666", margin: 0 }}>
                {title}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            borderTop: "1px solid #e0ddd5",
            paddingTop: 12,
          }}
        >
          <p style={{ fontFamily: "monospace", fontSize: 10, color: "#888", margin: "0 0 4px" }}>
            Issued: {formatDate(issuedAt)} · Valid for 1 year from date of issue
          </p>
          <p style={{ fontFamily: "monospace", fontSize: 9, color: "#bbb", margin: 0 }}>
            This document is issued by the Human Certification Authority and certifies the above
            individual as human pending annual re-evaluation. Verification at modernhuman.io.
          </p>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="font-mono text-xs tracking-widest uppercase border border-gray-800 px-8 py-3 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {downloading ? "Generating..." : "Download Certificate"}
      </button>
    </div>
  );
}
