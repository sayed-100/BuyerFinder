"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { SearchForm } from "@/components/SearchForm";
import { SearchLoading } from "@/components/SearchLoading";
import { ProspectTable } from "@/components/ProspectTable";
import { ProspectDrawer } from "@/components/ProspectDrawer";
import { ProspectsView } from "@/components/ProspectsView";
import { OutreachView } from "@/components/OutreachView";
import { HelpModal } from "@/components/HelpModal";
import { Search, RotateCcw, MapPin, Tag, Sparkles } from "lucide-react";

export default function HomePage() {
  const {
    activeTab,
    hasSearched,
    isSearching,
    searchRequest,
    setSearchRequest,
    executeSearch,
  } = useApp();

  const [isEditingSearch, setIsEditingSearch] = useState(false);
  const [inlineCategory, setInlineCategory] = useState(searchRequest.productCategory);
  const [inlineMarket, setInlineMarket] = useState(searchRequest.targetMarket);

  const handleInlineSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineCategory.trim() || !inlineMarket.trim()) return;

    const updated = {
      ...searchRequest,
      productCategory: inlineCategory.trim(),
      targetMarket: inlineMarket.trim(),
    };
    setSearchRequest(updated);
    setIsEditingSearch(false);
    executeSearch(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* DISCOVER TAB */}
        {activeTab === "discover" && (
          <div className="space-y-6">
            {!hasSearched && !isSearching && (
              <div className="pt-6 sm:pt-12">
                <SearchForm />
              </div>
            )}

            {isSearching && <SearchLoading />}

            {hasSearched && !isSearching && (
              <div className="space-y-6">
                {/* Compact query bar */}
                <div className="rounded-lg border border-zinc-200 bg-white p-3.5 shadow-2xs">
                  {isEditingSearch ? (
                    <form onSubmit={handleInlineSearch} className="flex flex-col sm:flex-row gap-2.5 items-center">
                      <div className="relative flex-1 w-full">
                        <Tag className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="text"
                          value={inlineCategory}
                          onChange={(e) => setInlineCategory(e.target.value)}
                          placeholder="Product category..."
                          className="w-full rounded-md border border-zinc-200 bg-zinc-50/60 py-1.5 pl-8 pr-3 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="relative flex-1 w-full">
                        <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="text"
                          value={inlineMarket}
                          onChange={(e) => setInlineMarket(e.target.value)}
                          placeholder="Target market (e.g. Austin, TX)..."
                          className="w-full rounded-md border border-zinc-200 bg-zinc-50/60 py-1.5 pl-8 pr-3 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => setIsEditingSearch(false)}
                          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
                        >
                          Update Search
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-zinc-900">Current Search:</span>
                        <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-zinc-800">
                          <Tag className="h-3 w-3 text-zinc-500" />
                          {searchRequest.productCategory}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-zinc-800">
                          <MapPin className="h-3 w-3 text-zinc-500" />
                          {searchRequest.targetMarket}
                        </span>
                        {searchRequest.businessType && searchRequest.businessType !== "all" && (
                          <span className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-800">
                            {searchRequest.businessType}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setInlineCategory(searchRequest.productCategory);
                            setInlineMarket(searchRequest.targetMarket);
                            setIsEditingSearch(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900 underline"
                        >
                          <span>Modify criteria</span>
                        </button>
                        <span className="text-zinc-300">|</span>
                        <button
                          onClick={() => executeSearch()}
                          className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900"
                          title="Re-run search"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Refresh</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Results Table */}
                <ProspectTable />
              </div>
            )}
          </div>
        )}

        {/* PROSPECTS SHORTLIST TAB */}
        {activeTab === "prospects" && <ProspectsView />}

        {/* OUTREACH WORKFLOW TAB */}
        {activeTab === "outreach" && <OutreachView />}
      </main>

      {/* Prospect Detail Drawer */}
      <ProspectDrawer />

      {/* Help & Documentation Modal */}
      <HelpModal />

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800">BuyerFinder</span>
            <span>—</span>
            <span>Find the businesses that could sell your products.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span>Designed for US Home Decor Sellers</span>
            <span>•</span>
            <span>API Web Development Hiring Task</span>
            <span>•</span>
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-zinc-600">v0.1.0-alpha</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
