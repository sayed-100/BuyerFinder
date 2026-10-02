"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  Users,
  Send,
  Trash2,
  ExternalLink,
  Mail,
  CheckCircle,
  AlertCircle,
  PlusCircle,
} from "lucide-react";

export function ProspectsView() {
  const {
    savedProspects,
    removeSavedProspect,
    clearAllSavedProspects,
    setActiveTab,
    openDrawer,
  } = useApp();

  const selectedProspects = savedProspects;

  const emailEligibleCount = selectedProspects.filter(
    (p) => p.contact.hasVerifiedEmail && p.contact.email
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Selected Prospects
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Manage your curated shortlist of potential wholesale retail prospects for outreach.
          </p>
        </div>

        {selectedProspects.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab("outreach")}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              Compose Outreach ({emailEligibleCount} with email)
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {selectedProspects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 mb-3">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900">No prospects selected yet</h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            Use the Discover tab to search Google Places for verified businesses, review potential prospects, and check
            their profile to add them to your outreach list.
          </p>
          <button
            onClick={() => setActiveTab("discover")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Discover prospects now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Banner */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900">
                {selectedProspects.length} total prospect{selectedProspects.length > 1 ? "s" : ""}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">
                {emailEligibleCount} have public business emails
              </span>
              {selectedProspects.length - emailEligibleCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-zinc-500">
                    {selectedProspects.length - emailEligibleCount} require manual web/phone outreach
                  </span>
                </>
              )}
            </div>

            <button
              onClick={clearAllSavedProspects}
              className="text-xs text-zinc-500 hover:text-red-600 transition-colors self-start sm:self-auto"
            >
              Clear all selected
            </button>
          </div>

          {/* Prospects List */}
          <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white shadow-xs">
            {selectedProspects.map((prospect) => (
              <div
                key={prospect.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDrawer(prospect)}
                      className="font-semibold text-zinc-900 hover:underline text-sm"
                    >
                      {prospect.businessName}
                    </button>
                    {prospect.contact.hasVerifiedEmail ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-200">
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                        Public business email
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                        Email not publicly available
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span className="font-medium text-zinc-700">{prospect.businessType}</span>
                    <span>•</span>
                    <span>
                      {prospect.city}, {prospect.state}
                    </span>
                    {prospect.contact.email && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-zinc-600">{prospect.contact.email}</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-zinc-600 line-clamp-1 max-w-xl">
                    {prospect.relevanceExplanation}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {prospect.website && (
                    <a
                      href={prospect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-zinc-200 bg-white p-1.5 text-zinc-600 hover:bg-zinc-100 transition-colors"
                      title="Visit business website"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  <button
                    onClick={() => openDrawer(prospect)}
                    className="rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => removeSavedProspect(prospect.id)}
                    className="rounded border border-zinc-200 bg-white p-1.5 text-zinc-400 hover:text-red-600 hover:border-red-200 transition-colors"
                    title="Remove from selected"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
