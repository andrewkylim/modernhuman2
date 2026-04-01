import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Are you still human? | modernhuman.io",
  description: "The world's first Human Certification Authority. Get certified in five minutes.",
  openGraph: {
    title: "Are you still human? | modernhuman.io",
    description: "The world's first Human Certification Authority. Get certified in five minutes.",
    url: "https://modernhuman.io",
    siteName: "Human Certification Authority",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Are you still human? | modernhuman.io",
    description: "The world's first Human Certification Authority. Get certified in five minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-cream text-ink`}>
        {children}
      </body>
    </html>
  );
}
