"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Assessment {
  id: string;
  name: string;
  modern_human_score: number;
  certification_tier: string;
  webcam_url?: string;
  created_at: string;
}

export default function RegistryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch count
        const { count: total, error: countErr } = await supabase
          .from("assessments")
          .select("*", { count: "exact", head: true });
        
        if (total !== null) setCount(total);

        // Fetch recent assessments
        let query = supabase
          .from("assessments")
          .select("id, name, modern_human_score, certification_tier, webcam_url, created_at")
          .order("created_at", { ascending: false })
          .limit(48);
        
        if (filter !== "All") {
          query = query.eq("certification_tier", filter);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (data) setAssessments(data);
      } catch (err) {
        console.error("Registry load failure:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filter]);

  const tiers = ["All", "Diamond", "Platinum", "Gold", "Silver", "Bronze"];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1B2E4B] flex flex-col font-sans">
      {/* Network Status Header */}
      <div className="bg-[#1B2E4B] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/50">
              Registry Node 001 / PUBLIC_ACCESS
            </span>
          </div>
          <span className="font-mono text-[9px] tracking-widest text-white/30 hidden sm:block">
            ACTIVE_RECORDS: {count.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-[#1B2E4B]/10 bg-white sticky top-0 z-50">
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

          <nav className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-widest font-bold">
            <Link href="/" className="text-[#1B2E4B]/40 hover:text-[#1B2E4B] transition-colors">Home</Link>
            <Link href="/assess" className="bg-[#1B2E4B] text-white px-4 py-2 hover:bg-[#1B2E4B]/90 transition-colors">Get Certified</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#1B2E4B]/30 mb-2">Global Identity Ledger</p>
              <h1 className="text-5xl font-bold tracking-tight text-[#1B2E4B]">Humanity Registry</h1>
              <p className="text-sm text-[#1B2E4B]/50 mt-4 max-w-lg font-serif italic italic leading-relaxed">
                A public record of verified biological entities. This registry catalogs the unique cognitive and motor anomalies of every certified human.
              </p>
            </div>
            <div className="bg-white border border-[#1B2E4B]/10 p-6 flex items-center gap-6 shadow-xl">
               <div className="text-center">
                  <div className="text-3xl font-bold text-[#1B2E4B]">{count.toLocaleString()}</div>
                  <div className="text-[9px] uppercase tracking-widest font-mono text-[#1B2E4B]/40 mt-1">Certified Humans</div>
               </div>
               <div className="w-px h-10 bg-[#1B2E4B]/10" />
               <div>
                  <Link href="/assess" className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1B2E4B] border-b-2 border-[#1B2E4B] pb-0.5 hover:opacity-70 transition-opacity">
                    Join the ledger →
                  </Link>
               </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#1B2E4B]/10 pb-6">
             <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1B2E4B]/30 mr-4">Filter by Tier:</span>
             {tiers.map((t) => (
               <button
                 key={t}
                 onClick={() => setFilter(t)}
                 className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                   filter === t 
                    ? "bg-[#1B2E4B] text-white" 
                    : "text-[#1B2E4B]/50 hover:bg-slate-100"
                 }`}
               >
                 {t}
               </button>
             ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {assessments.map((human) => (
              <Link 
                key={human.id} 
                href={`/verify?id=${human.id}`}
                className="group relative bg-white border border-[#1B2E4B]/5 hover:border-[#1B2E4B]/20 transition-all hover:shadow-2xl hover:-translate-y-1 block"
              >
                <div className="aspect-square bg-slate-900 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                  {human.webcam_url ? (
                    <img 
                      src={human.webcam_url} 
                      alt={human.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-[10px] text-white/20">NO_BIO_IMAGE</span>
                    </div>
                  )}
                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[7px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    VERIFIED
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-tighter truncate text-[#1B2E4B]">
                      {human.name}
                    </h3>
                    <span className="font-mono text-[9px] font-bold text-emerald-600">
                      {human.modern_human_score}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-mono text-[#1B2E4B]/40 uppercase tracking-widest">
                    <span>{human.certification_tier}</span>
                    <span>{new Date(human.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Hover metadata */}
                <div className="absolute inset-0 bg-[#1B2E4B]/90 text-white p-4 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-center items-center text-center">
                   <div className="font-mono text-[10px] tracking-[0.2em] mb-4 text-emerald-400">VIEW DOSSIER</div>
                   <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                      <span className="text-xs">→</span>
                   </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && assessments.length === 0 && (
          <div className="text-center py-24 border border-dashed border-[#1B2E4B]/10">
            <p className="text-sm text-[#1B2E4B]/30 font-mono uppercase tracking-[0.3em]">No records found for this tier.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-[#1B2E4B]/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-[#1B2E4B]/20 flex items-center justify-center">
                <span className="text-[#1B2E4B]/20 text-[6px] font-bold">HCA</span>
              </div>
              <span className="text-[10px] font-mono text-[#1B2E4B]/20 uppercase tracking-widest">Registry Node 001</span>
           </div>
           
           <div className="text-[9px] font-mono text-[#1B2E4B]/25 uppercase tracking-widest leading-relaxed text-center md:text-right">
             The HCA Registry is a public, permanent ledger of humanity.<br/>
             © 2026 Human Certification Authority
           </div>
        </div>
      </footer>
    </div>
  );
}
