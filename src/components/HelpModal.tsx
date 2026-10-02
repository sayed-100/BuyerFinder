"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { X, Search, CheckCircle2, ShieldCheck, Mail, Database, HelpCircle } from "lucide-react";

export function HelpModal() {
  const { isHelpOpen, setIsHelpOpen } = useApp();

  if (!isHelpOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-zinc-800" />
            <h2 className="text-base font-semibold text-zinc-900">
              How BuyerFinder Works
            </h2>
          </div>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-zinc-600 max-h-[80vh] overflow-y-auto">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Purpose &amp; Workflow
            </h3>
            <p className="mt-1 leading-relaxed">
              BuyerFinder is engineered for US home-decor artisans, studios, and manufacturers to
              discover relevant retail shops, boutiques, and interior design firms, verify their
              public contact channels, and initiate professional wholesale outreach.
            </p>
          </div>

          {/* 4 Core Principles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-900 text-xs">
                <Search className="h-3.5 w-3.5 text-zinc-700" />
                <span>1. Live Discovery</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Queries commercial places registries dynamically based on your product category and
                target US market.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-900 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-700" />
                <span>2. Factual Relevance</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Businesses are labeled as potential prospects, not guaranteed buyers. Relevancy is
                grounded in public business taxonomy.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-900 text-xs">
                <Database className="h-3.5 w-3.5 text-zinc-700" />
                <span>3. Contact Transparency</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Clearly distinguishes verified public business email addresses from businesses that
                require phone or direct web contact.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-900 text-xs">
                <Mail className="h-3.5 w-3.5 text-zinc-700" />
                <span>4. Direct Outreach</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Template-driven personalized email dispatch with token interpolation, safety
                confirmation, and delivery logs.
              </p>
            </div>
          </div>

          {/* Production & Live Architecture */}
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-3 text-[11px] text-emerald-950 space-y-1.5">
            <span className="font-semibold text-emerald-900">Live Production Architecture:</span>
            <ul className="space-y-1 list-disc list-inside text-emerald-900/90 leading-relaxed">
              <li>
                <strong>Google Places API (New):</strong> Live commercial directory discovery returning verified businesses, categories, websites, and phone numbers.
              </li>
              <li>
                <strong>Public Website Email Enrichment:</strong> Server-side SSRF-protected contact discovery indexing public business emails directly from official store websites.
              </li>
              <li>
                <strong>Google OAuth 2.0 &amp; Gmail API:</strong> Secure session-based OAuth dispatch sending personalized inquiries directly from your authenticated Gmail address.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3 flex justify-end">
          <button
            onClick={() => setIsHelpOpen(false)}
            className="rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
