"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Prospect } from "@/types";
import {
  ExternalLink,
  Mail,
  Phone,
  Check,
  Search,
  Filter,
  CheckSquare,
  Square,
  ChevronRight,
  Send,
  AlertCircle,
} from "lucide-react";

function getDisplayHostname(urlStr: string): string {
  try {
    const parsed = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return urlStr.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || urlStr;
  }
}

export function ProspectTable() {
  const {
    searchResults,
    searchRequest,
    selectedProspectIds,
    toggleProspectSelection,
    selectAllResults,
    deselectAllResults,
    openDrawer,
    setActiveTab,
    isCurrentResultsMock,
    searchError,
  } = useApp();

  const [textFilter, setTextFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [hasEmailFilter, setHasEmailFilter] = useState(false);

  // Available business types for local filter
  const businessTypes = useMemo(() => {
    const types = new Set(searchResults.map((p) => p.businessType));
    return Array.from(types);
  }, [searchResults]);

  // Filtered prospects
  const filteredProspects = useMemo(() => {
    return searchResults.filter((p) => {
      const matchesText =
        !textFilter ||
        (p.businessName || "").toLowerCase().includes(textFilter.toLowerCase()) ||
        (p.city || "").toLowerCase().includes(textFilter.toLowerCase()) ||
        (p.address || "").toLowerCase().includes(textFilter.toLowerCase());

      const matchesType = typeFilter === "all" || p.businessType === typeFilter;
      const matchesEmail = !hasEmailFilter || p.contact.hasVerifiedEmail;

      return matchesText && matchesType && matchesEmail;
    });
  }, [searchResults, textFilter, typeFilter, hasEmailFilter]);

  const areAllFilteredSelected =
    filteredProspects.length > 0 &&
    filteredProspects.every((p) => selectedProspectIds.includes(p.id));

  const handleToggleSelectAll = () => {
    if (areAllFilteredSelected) {
      // Deselect filtered
      filteredProspects.forEach((p) => {
        if (selectedProspectIds.includes(p.id)) {
          toggleProspectSelection(p);
        }
      });
    } else {
      // Select all filtered
      filteredProspects.forEach((p) => {
        if (!selectedProspectIds.includes(p.id)) {
          toggleProspectSelection(p);
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Error Alert (if any) */}
      {searchError && (
        <div className="rounded-lg border border-red-200 bg-red-50/70 p-4 text-xs text-red-900 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-semibold">Discovery Provider Error</span>
              <p className="text-red-800 leading-relaxed">{searchError}</p>
              <p className="text-[11px] text-red-600">
                Please verify that GOOGLE_PLACES_API_KEY is configured in your environment or set
                ENABLE_REAL_APIS=&quot;false&quot; in .env.local to use development sandbox data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Context */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              Potential prospects
            </h2>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
              {filteredProspects.length} of {searchResults.length} businesses
            </span>
            {searchError ? (
              <span className="rounded bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 text-[10px] font-medium">
                Live Discovery Error
              </span>
            ) : isCurrentResultsMock ? (
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                Sandbox Mode
              </span>
            ) : (
              <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium">
                Google Places API (Live)
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            Discovered for &ldquo;{searchRequest.productCategory}&rdquo; in {searchRequest.targetMarket}
          </p>
        </div>

        {/* Selected count action button */}
        {selectedProspectIds.length > 0 && (
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-zinc-600">
              {selectedProspectIds.length} prospect{selectedProspectIds.length > 1 ? "s" : ""}{" "}
              selected
            </span>
            <button
              onClick={() => setActiveTab("outreach")}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              Prepare outreach ({selectedProspectIds.length})
            </button>
          </div>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 rounded-lg border border-zinc-200 bg-white p-2.5 text-xs">
        {/* Search input */}
        <div className="relative sm:col-span-4">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={textFilter}
            onChange={(e) => setTextFilter(e.target.value)}
            placeholder="Search prospects by name, city, address..."
            className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        {/* Business type dropdown */}
        <div className="sm:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 py-1.5 px-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
          >
            <option value="all">All business types</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Has email only checkbox */}
        <div className="flex items-center sm:col-span-3">
          <label className="inline-flex cursor-pointer items-center gap-2 select-none text-zinc-700">
            <input
              type="checkbox"
              checked={hasEmailFilter}
              onChange={(e) => setHasEmailFilter(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span>Has business email only</span>
          </label>
        </div>

        {/* Select all toggle */}
        <div className="flex items-center justify-end sm:col-span-2">
          <button
            onClick={handleToggleSelectAll}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            {areAllFilteredSelected ? (
              <>
                <CheckSquare className="h-3.5 w-3.5 text-zinc-900" />
                <span>Deselect all</span>
              </>
            ) : (
              <>
                <Square className="h-3.5 w-3.5 text-zinc-400" />
                <span>Select all</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table Results */}
      {filteredProspects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center">
          <p className="text-sm font-medium text-zinc-800">No prospects match your active filters</p>
          <p className="mt-1 text-xs text-zinc-500">
            Try adjusting your search keywords, business type, or email availability filter.
          </p>
          <button
            onClick={() => {
              setTextFilter("");
              setTypeFilter("all");
              setHasEmailFilter(false);
            }}
            className="mt-3 text-xs font-medium text-zinc-900 underline hover:text-zinc-700"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
                  <th scope="col" className="w-10 px-3 py-2.5 text-center">
                    <span className="sr-only">Select</span>
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Business Name &amp; Type
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Location
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Contact / Website
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Email Status
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Relevance
                  </th>
                  <th scope="col" className="w-24 px-3.5 py-2.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70">
                {filteredProspects.map((prospect) => {
                  const isSelected = selectedProspectIds.includes(prospect.id);

                  return (
                    <tr
                      key={prospect.id}
                      className={`group hover:bg-zinc-50/80 transition-colors ${
                        isSelected ? "bg-zinc-50/60" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3 text-center align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProspectSelection(prospect)}
                          className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                        />
                      </td>

                      {/* Business Name & Type */}
                      <td className="px-3.5 py-3 align-top">
                        <button
                          onClick={() => openDrawer(prospect)}
                          className="text-left font-semibold text-zinc-900 hover:underline flex items-baseline gap-1"
                        >
                          <span>{prospect.businessName}</span>
                        </button>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
                          <span className="font-medium text-zinc-700">{prospect.businessType}</span>
                          <span>•</span>
                          <span>{prospect.category}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-3.5 py-3 align-top text-zinc-600">
                        <div className="font-medium text-zinc-900">
                          {prospect.city}, {prospect.state}
                        </div>
                        <div className="text-[11px] text-zinc-500 leading-tight truncate max-w-[180px]">
                          {prospect.address}
                        </div>
                      </td>

                      {/* Contact / Website */}
                      <td className="px-3.5 py-3 align-top space-y-1">
                        {prospect.website ? (
                          <a
                            href={prospect.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 hover:text-zinc-900 hover:underline"
                          >
                            <span>{getDisplayHostname(prospect.website)}</span>
                            <ExternalLink className="h-3 w-3 text-zinc-400" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-zinc-400">No website listed</span>
                        )}

                        {prospect.contact.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                            <Phone className="h-3 w-3 text-zinc-400" />
                            <span>{prospect.contact.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Email Status */}
                      <td className="px-3.5 py-3 align-top">
                        {prospect.contact.hasVerifiedEmail ? (
                          <div className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span>Public business email</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                            Email not publicly available
                          </span>
                        )}
                        {prospect.contact.contactPerson && (
                          <div className="mt-1 text-[11px] text-zinc-500">
                            Contact: {prospect.contact.contactPerson}
                          </div>
                        )}
                      </td>

                      {/* Relevance Summary */}
                      <td className="px-3.5 py-3 align-top max-w-xs">
                        <p className="text-[11px] text-zinc-600 leading-relaxed line-clamp-2">
                          {prospect.relevanceExplanation}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3 align-top text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openDrawer(prospect)}
                          className="rounded border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => toggleProspectSelection(prospect)}
                          className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                            isSelected
                              ? "bg-zinc-900 text-white"
                              : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trust & Source Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] text-zinc-500 border-t border-zinc-100">
        <p>
          Data sources: {isCurrentResultsMock ? "Commercial registries and business directories (Sandbox Mode)" : "Google Places API (New) Live Commercial Directory"}
        </p>
        <p className="italic text-zinc-400">
          Businesses are potential prospects for wholesale inquiries, not confirmed buyers.
        </p>
      </div>
    </div>
  );
}
