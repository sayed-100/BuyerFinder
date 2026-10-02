"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Search, Users, Mail, HelpCircle, ShieldCheck } from "lucide-react";

export function Navbar() {
  const {
    activeTab,
    setActiveTab,
    selectedProspectIds,
    setIsHelpOpen,
    isGmailConnected,
    gmailUserEmail,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Nav */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => setActiveTab("discover")}
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white font-semibold text-xs tracking-tight">
              BF
            </div>
            <span className="text-base font-semibold tracking-tight text-zinc-900">
              BuyerFinder
            </span>
          </div>

          <nav className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab("discover")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "discover"
                  ? "bg-zinc-100 text-zinc-900 font-semibold"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              Discover
            </button>

            <button
              onClick={() => setActiveTab("prospects")}
              className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "prospects"
                  ? "bg-zinc-100 text-zinc-900 font-semibold"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Prospects
              {selectedProspectIds.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-zinc-900 px-1.5 py-0.2 text-[10px] font-medium text-white">
                  {selectedProspectIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("outreach")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "outreach"
                  ? "bg-zinc-100 text-zinc-900 font-semibold"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Outreach
            </button>
          </nav>
        </div>

        {/* Right side utilities */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Google Places Live</span>
          </div>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden md:inline">How it works</span>
          </button>

          <div className="h-4 w-px bg-zinc-200" />

          {/* Account / Sender Identity */}
          <div className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-medium ${
              isGmailConnected
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-zinc-100 border-zinc-300 text-zinc-700"
            }`}>
              {isGmailConnected && gmailUserEmail
                ? gmailUserEmail.slice(0, 2).toUpperCase()
                : "DS"}
            </div>
            <div className="hidden sm:flex flex-col text-left max-w-[170px]">
              <span className="text-xs font-medium text-zinc-900 leading-tight truncate">
                {isGmailConnected && gmailUserEmail ? gmailUserEmail : "Demo Workspace"}
              </span>
              <span className="text-[10px] text-zinc-500 leading-tight truncate">
                {isGmailConnected ? "Connected Sender (OAuth)" : "Gmail not connected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
