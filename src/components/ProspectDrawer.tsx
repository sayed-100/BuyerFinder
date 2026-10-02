"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  X,
  ExternalLink,
  Mail,
  Phone,
  Building,
  MapPin,
  CheckCircle,
  AlertCircle,
  Plus,
  Check,
  Send,
  Sparkles,
} from "lucide-react";

export function ProspectDrawer() {
  const {
    selectedDrawerProspect,
    closeDrawer,
    selectedProspectIds,
    toggleProspectSelection,
    setActiveTab,
  } = useApp();

  if (!selectedDrawerProspect) return null;

  const prospect = selectedDrawerProspect;
  const isSelected = selectedProspectIds.includes(prospect.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={closeDrawer} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 bg-zinc-50/50">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Prospect Profile
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              {prospect.businessName}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-700">
          {/* Business Core Info */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3 shadow-2xs">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] font-medium text-zinc-400 uppercase">
                  Business Classification
                </span>
                <p className="mt-0.5 font-medium text-zinc-900">{prospect.businessType}</p>
                <p className="text-zinc-500 text-[11px]">{prospect.category}</p>
              </div>

              <div>
                <span className="text-[11px] font-medium text-zinc-400 uppercase">Location</span>
                <p className="mt-0.5 font-medium text-zinc-900">
                  {prospect.city}, {prospect.state}
                </p>
                <p className="text-zinc-500 text-[11px]">{prospect.address}</p>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-medium text-zinc-400 uppercase">Website</span>
                <div className="mt-0.5">
                  {prospect.website ? (
                    <a
                      href={prospect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-zinc-900 hover:underline"
                    >
                      <span className="truncate max-w-[170px]">{prospect.website}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0 text-zinc-400" />
                    </a>
                  ) : (
                    <span className="text-zinc-400">Not listed</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-zinc-400 uppercase">Phone</span>
                <p className="mt-0.5 font-medium text-zinc-900">
                  {prospect.contact.phone || "Not listed"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Verification Section */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Contact Information
              </span>
              {prospect.contact.hasVerifiedEmail ? (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                  Public business email
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                  Email not publicly available
                </span>
              )}
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                <span className="font-mono text-xs text-zinc-800">
                  {prospect.contact.email || "No direct public email found (use website or phone)"}
                </span>
              </div>

              {prospect.contact.contactPerson && (
                <div className="text-[11px] text-zinc-600">
                  Key Contact:{" "}
                  <strong className="text-zinc-900">{prospect.contact.contactPerson}</strong>{" "}
                  {prospect.contact.contactRole && `(${prospect.contact.contactRole})`}
                </div>
              )}

              {prospect.contact.socialHandles?.instagram && (
                <div className="text-[11px] text-zinc-500">
                  Social:{" "}
                  <span className="text-zinc-700">{prospect.contact.socialHandles.instagram}</span>
                </div>
              )}
            </div>
          </div>

          {/* Why this may be relevant */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 space-y-2">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Why this business may be relevant
            </h3>
            <p className="text-xs leading-relaxed text-zinc-700">
              {prospect.relevanceExplanation}
            </p>
            <div className="pt-2 text-[11px] text-zinc-400 border-t border-zinc-200/60">
              Explanation derived from public commercial registry descriptors and business scope.
              BuyerFinder does not guarantee buying intent.
            </div>
          </div>

          {/* Discovery Metadata */}
          <div className="space-y-1 text-[11px] text-zinc-400">
            <div>
              Source registry: <span className="text-zinc-600">{prospect.source}</span>
            </div>
            <div>
              Indexed on:{" "}
              <span className="text-zinc-600">
                {new Date(prospect.discoveredAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-zinc-200 bg-zinc-50/80 p-4 flex items-center justify-between gap-3">
          {prospect.website && (
            <a
              href={prospect.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
            >
              <span>Visit website</span>
              <ExternalLink className="h-3 w-3 text-zinc-400" />
            </a>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => toggleProspectSelection(prospect)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-colors shadow-xs ${
                isSelected
                  ? "bg-zinc-200 text-zinc-800 hover:bg-zinc-300"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Remove from outreach</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add to outreach</span>
                </>
              )}
            </button>

            {isSelected && (
              <button
                onClick={() => {
                  closeDrawer();
                  setActiveTab("outreach");
                }}
                className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Go to Outreach</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
