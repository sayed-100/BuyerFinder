"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  EmailRequest,
  EmailResult,
  OutreachRecord,
} from "@/types";
import {
  Send,
  Mail,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Building,
  ExternalLink,
} from "lucide-react";

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const isDevMode = process.env.NODE_ENV !== "production";

function formatLocation(city?: string, state?: string): string {
  const cleanCity = city && city !== "Unknown City" ? city.trim() : "";
  const cleanState = state && state !== "Unknown State" ? state.trim() : "";
  if (cleanCity && cleanState) return `${cleanCity}, ${cleanState}`;
  if (cleanCity) return cleanCity;
  if (cleanState) return cleanState;
  return "your area";
}

export function OutreachView() {
  const {
    savedProspects,
    outreachHistory,
    addOutreachRecords,
    setActiveTab,
    isGmailConnected,
    gmailUserEmail,
    refreshGmailStatus,
    disconnectGmail,
  } = useApp();

  const selectedProspects = savedProspects;

  // Development-only test recipient state
  const [testRecipient, setTestRecipient] = useState("");
  const isTestRecipientEntered = isDevMode && testRecipient.trim().length > 0;
  const isValidTestEmail = isTestRecipientEntered && EMAIL_REGEX.test(testRecipient.trim());
  const hasTestOverride = isDevMode && isValidTestEmail;

  const eligibleProspects = selectedProspects.filter(
    (p) => hasTestOverride || (p.contact.hasVerifiedEmail && p.contact.email)
  );
  const unindexedProspects = selectedProspects.filter(
    (p) => !hasTestOverride && (!p.contact.hasVerifiedEmail || !p.contact.email)
  );

  const [authBanner, setAuthBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Email form state with persistent sender name
  const [senderName, setSenderName] = useState("Home Decor Studio");
  const [subjectTemplate, setSubjectTemplate] = useState(
    "Wholesale home decor partnership - {{businessName}}"
  );
  const [bodyTemplate, setBodyTemplate] = useState(
    `Hi {{contactPerson}},\n\nI'm reaching out because we supply handmade home decor products and are looking to work with selected retailers in {{location}}.\n\nI came across {{businessName}} and thought our collection might be a natural fit for your customers.\n\nWould you be open to taking a look at our wholesale catalog?\n\nBest,\n{{sellerName}}`
  );

  // Active preview index
  const [previewIndex, setPreviewIndex] = useState(0);

  // Sending states
  const [isSending, setIsSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastResult, setLastResult] = useState<EmailResult | null>(null);

  // Restore persisted sender name
  useEffect(() => {
    try {
      const stored = localStorage.getItem("buyerfinder_sender_name");
      if (stored && stored.trim().length > 0) {
        setSenderName(stored.trim());
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSenderNameChange = (val: string) => {
    setSenderName(val);
    try {
      localStorage.setItem("buyerfinder_sender_name", val);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    refreshGmailStatus();

    // Check for OAuth redirect query parameters
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auth_success") === "true") {
        setAuthBanner({
          type: "success",
          message: "✓ Gmail connected successfully. Emails will be sent from your authorized Gmail account.",
        });
        window.history.replaceState({}, "", "/?tab=outreach");
        refreshGmailStatus();
      } else if (params.get("auth_error")) {
        const err = params.get("auth_error");
        setAuthBanner({
          type: "error",
          message: `Gmail authorization was not completed (${err}). Please click "Connect Gmail" to try again.`,
        });
        window.history.replaceState({}, "", "/?tab=outreach");
      }
    }
  }, [refreshGmailStatus]);

  const handleConnectGmail = () => {
    window.location.href = "/api/auth/google";
  };

  const handleDisconnectGmail = async () => {
    await disconnectGmail();
    setAuthBanner(null);
  };

  // Helper to resolve variables for preview
  const getResolvedPreview = (prospectIndex: number) => {
    const target = eligibleProspects[prospectIndex] || selectedProspects[0];
    if (!target) return { subject: "", body: "", target: null };

    const loc = formatLocation(target.city, target.state);
    const contact = target.contact?.contactPerson || "Store Manager";

    const subject = subjectTemplate
      .replace(/{{businessName}}/g, target.businessName)
      .replace(/{{location}}/g, loc)
      .replace(/{{sellerName}}/g, senderName)
      .replace(/{{contactPerson}}/g, contact);

    const body = bodyTemplate
      .replace(/{{businessName}}/g, target.businessName)
      .replace(/{{location}}/g, loc)
      .replace(/{{sellerName}}/g, senderName)
      .replace(/{{contactPerson}}/g, contact);

    return { subject, body, target };
  };

  const preview = getResolvedPreview(previewIndex);

  const handleSendEmails = async () => {
    setShowConfirmModal(false);

    const targetProspects = hasTestOverride ? selectedProspects : eligibleProspects;
    if (targetProspects.length === 0) {
      alert("No valid recipient email addresses available to send to.");
      return;
    }

    setIsSending(true);

    try {
      const emailPayload: EmailRequest = {
        recipients: targetProspects.map((p) => ({
          id: p.id,
          businessName: p.businessName,
          recipientEmail: hasTestOverride ? testRecipient.trim() : p.contact.email,
          location: formatLocation(p.city, p.state),
          contactPerson: p.contact.contactPerson || null,
        })),
        senderName,
        senderEmail: gmailUserEmail || "authorized-gmail-user",
        subjectTemplate,
        bodyTemplate,
        ...(hasTestOverride ? { testRecipientOverride: testRecipient.trim() } : {}),
      };

      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to dispatch outreach batch");
      }

      const result: EmailResult = await res.json();
      setLastResult(result);

      // Record deliveries into outreach activity history
      const newRecords: OutreachRecord[] = result.deliveries.map((delivery) => {
        return {
          id: `outreach-${Date.now()}-${delivery.prospectId}`,
          batchId: result.batchId,
          prospectId: delivery.prospectId,
          businessName: delivery.businessName,
          recipientEmail: delivery.recipientEmail,
          subject: subjectTemplate.replace(/{{businessName}}/g, delivery.businessName),
          bodyPreview: bodyTemplate.slice(0, 100) + "...",
          status: delivery.status,
          timestamp: delivery.sentAt,
        };
      });

      addOutreachRecords(newRecords);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Outreach dispatch failed";
      console.error("Outreach dispatch error:", err);
      alert(`Outreach dispatch issue: ${msg}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-zinc-200 pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
          Direct Outreach
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Compose and dispatch personalized wholesale inquiries to verified public business emails.
        </p>
      </div>

      {/* Auth Banner Notice */}
      {authBanner && (
        <div
          className={`flex items-center justify-between rounded-lg p-3 text-xs border ${
            authBanner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {authBanner.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span>{authBanner.message}</span>
          </div>
          <button
            onClick={() => setAuthBanner(null)}
            className="text-[11px] underline hover:no-underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Gmail Account Integration Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isGmailConnected ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-medium text-zinc-900">
                <span>Gmail Account Integration</span>
                {isGmailConnected ? (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ✓ Gmail connected
                  </span>
                ) : (
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                    Not connected
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                {isGmailConnected
                  ? `Emails will be sent from your connected Gmail account (${gmailUserEmail}).`
                  : "Connect your personal Gmail account via Google OAuth 2.0 to send emails directly."}
              </p>
            </div>
          </div>

          <div>
            {isGmailConnected ? (
              <button
                type="button"
                onClick={handleDisconnectGmail}
                className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-red-600 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectGmail}
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <span>Connect Gmail</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* When no prospects are selected */}
      {selectedProspects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 mb-3">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900">No prospects selected for outreach</h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            Select one or more potential prospects from the Discover or Prospects tab to compose an
            inquiry.
          </p>
          <button
            onClick={() => setActiveTab("discover")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            Find prospects now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status summary banner */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900">
                  {selectedProspects.length} prospect{selectedProspects.length > 1 ? "s" : ""} in
                  queue
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">
                  {eligibleProspects.length} ready to receive email
                </span>
                {unindexedProspects.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-700">
                      {unindexedProspects.length} without publicly listed email (will be skipped)
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={() => setActiveTab("prospects")}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900 underline self-start sm:self-auto"
              >
                Edit selected recipients
              </button>
            </div>
          </div>

          {/* Last Result Alert (if just sent) */}
          {lastResult && (
            <div
              className={`rounded-lg border p-4 text-xs ${
                lastResult.totalSent > 0
                  ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                  : "border-amber-200 bg-amber-50/70 text-amber-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold">
                  {lastResult.totalSent > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <span>
                    Batch Complete: {lastResult.totalSent} email
                    {lastResult.totalSent !== 1 ? "s" : ""} dispatched through Gmail
                    {lastResult.totalFailed > 0 && `, ${lastResult.totalFailed} skipped or failed`}
                  </span>
                </div>
                <button
                  onClick={() => setLastResult(null)}
                  className="text-zinc-500 hover:text-zinc-800 text-[11px]"
                >
                  Dismiss
                </button>
              </div>

              <div className="mt-3 space-y-1.5 border-t border-zinc-200/50 pt-2">
                {lastResult.deliveries.map((delivery) => (
                  <div
                    key={delivery.prospectId}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="font-medium">{delivery.businessName}</span>
                    <span
                      className={`font-mono ${
                        delivery.status === "sent" ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {delivery.status === "sent"
                        ? `✓ Email sent through Gmail to ${delivery.recipientEmail}`
                        : `✕ Skipped (${delivery.reason})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Composer Grid: Editor (left) + Live Personalization Preview (right) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Email Composer */}
            <div className="lg:col-span-7 space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-3 gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                  <Edit3 className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Outreach Message Template</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Tokens: <code className="text-zinc-700">&#123;&#123;businessName&#125;&#125;</code>,{" "}
                  <code className="text-zinc-700">&#123;&#123;location&#125;&#125;</code>,{" "}
                  <code className="text-zinc-700">&#123;&#123;sellerName&#125;&#125;</code>,{" "}
                  <code className="text-zinc-700">&#123;&#123;contactPerson&#125;&#125;</code>
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-zinc-600">Your Sender / Studio Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => handleSenderNameChange(e.target.value)}
                    placeholder="e.g. Home Decor Studio"
                    className="mt-1 w-full rounded-md border border-zinc-200 bg-zinc-50/50 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-400">
                    Used in message signatures &amp; tokens
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-600">From Gmail Account</label>
                  <input
                    type="email"
                    value={isGmailConnected && gmailUserEmail ? gmailUserEmail : "Gmail not connected"}
                    disabled
                    className="mt-1 w-full rounded-md border border-zinc-200 bg-zinc-100 px-2.5 py-1.5 text-xs text-zinc-700 cursor-not-allowed focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">
                    {isGmailConnected
                      ? "Locked to authenticated Gmail address"
                      : "OAuth authorization required to send"}
                  </span>
                </div>
              </div>

              {/* Development Test Recipient (Only shown when NODE_ENV !== "production") */}
              {isDevMode && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="dev-test-recipient"
                      className="text-[11px] font-semibold text-amber-950 flex items-center gap-1.5"
                    >
                      <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wide font-mono text-amber-900">
                        Dev Only
                      </span>
                      Development Test Recipient
                    </label>
                    {isTestRecipientEntered && (
                      <span
                        className={`text-[10px] font-medium ${
                          isValidTestEmail ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {isValidTestEmail ? "✓ Valid test recipient" : "✕ Invalid email format"}
                      </span>
                    )}
                  </div>
                  <input
                    id="dev-test-recipient"
                    type="email"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="Enter your own test email"
                    className={`mt-1.5 w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none ${
                      isTestRecipientEntered && !isValidTestEmail
                        ? "border-red-300 focus:border-red-500"
                        : "border-amber-300 focus:border-zinc-900"
                    }`}
                  />
                  <p className="mt-1 text-[11px] text-amber-800/90">
                    For testing only — overrides the selected prospect recipient.
                  </p>
                </div>
              )}

              {/* Subject */}
              <div className="text-xs">
                <label className="text-[11px] font-medium text-zinc-600">Subject Line</label>
                <input
                  type="text"
                  value={subjectTemplate}
                  onChange={(e) => setSubjectTemplate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-xs text-zinc-900 font-medium focus:border-zinc-900 focus:outline-none"
                />
              </div>

              {/* Body */}
              <div className="text-xs">
                <label className="text-[11px] font-medium text-zinc-600">Message Body</label>
                <textarea
                  rows={9}
                  value={bodyTemplate}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-200 p-3 text-xs text-zinc-800 leading-relaxed font-sans focus:border-zinc-900 focus:outline-none"
                />
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-100">
                <div className="text-[11px] text-zinc-500">
                  {hasTestOverride ? (
                    <span className="text-amber-800 font-medium">
                      TEST MODE: Sending to {testRecipient.trim()} ({eligibleProspects.length} prospect{eligibleProspects.length !== 1 ? "s" : ""} selected).
                    </span>
                  ) : isGmailConnected ? (
                    <span className="text-zinc-600">
                      Emails will be sent from your connected Gmail account ({gmailUserEmail}).
                    </span>
                  ) : (
                    <span className="text-amber-700">
                      Connect your Gmail account to send emails.
                    </span>
                  )}
                </div>
                {isGmailConnected ? (
                  <button
                    type="button"
                    disabled={
                      isSending ||
                      eligibleProspects.length === 0 ||
                      (isTestRecipientEntered && !isValidTestEmail)
                    }
                    onClick={() => setShowConfirmModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send email</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectGmail}
                    className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 focus:outline-none transition-colors shrink-0"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Connect Gmail</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right: Live Personalization Preview */}
            <div className="lg:col-span-5 space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-5">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                  <Eye className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Personalized Preview</span>
                </div>

                {eligibleProspects.length > 1 && (
                  <div className="flex items-center gap-1 text-[11px] text-zinc-600">
                    <span>
                      {previewIndex + 1} of {eligibleProspects.length}
                    </span>
                    <button
                      type="button"
                      disabled={previewIndex === 0}
                      onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
                      className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 hover:bg-zinc-100 disabled:opacity-40"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      disabled={previewIndex >= eligibleProspects.length - 1}
                      onClick={() =>
                        setPreviewIndex((prev) =>
                          Math.min(eligibleProspects.length - 1, prev + 1)
                        )
                      }
                      className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 hover:bg-zinc-100 disabled:opacity-40"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              {/* Development Test Recipient Banner in Preview */}
              {hasTestOverride && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-950 font-medium flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span>
                    TEST MODE — email will be sent to{" "}
                    <strong className="font-mono text-amber-900">{testRecipient.trim()}</strong>
                  </span>
                </div>
              )}

              {preview.target ? (
                <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3 shadow-2xs text-xs">
                  <div className="space-y-1 border-b border-zinc-100 pb-2.5">
                    <div className="text-[11px] text-zinc-400">
                      To:{" "}
                      {hasTestOverride ? (
                        <>
                          <span className="font-mono font-medium text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                            {testRecipient.trim()}
                          </span>{" "}
                          <span className="text-zinc-500 text-[10px]">
                            (Test override for {preview.target.businessName})
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-zinc-800">
                            {preview.target.contact.email || "No direct email"}
                          </span>{" "}
                          ({preview.target.businessName})
                        </>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Subject:{" "}
                      <span className="font-semibold text-zinc-900">{preview.subject}</span>
                    </div>
                  </div>

                  <div className="whitespace-pre-line text-zinc-700 leading-relaxed text-xs">
                    {preview.body}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500">
                  Select prospects with public business email to inspect personalized previews.
                </div>
              )}

              <div className="text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-200 pt-3">
                Emails are dispatched through the official Google Gmail API from your authorized
                account.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outreach Activity History */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Recent Outreach Activity</h3>
          </div>
          <span className="text-xs text-zinc-500">
            {outreachHistory.length} total event{outreachHistory.length !== 1 ? "s" : ""}
          </span>
        </div>

        {outreachHistory.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-xs text-zinc-500">
            No outreach dispatches recorded yet in this session.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
                    <th className="px-3.5 py-2.5">Date &amp; Time</th>
                    <th className="px-3.5 py-2.5">Recipient Business</th>
                    <th className="px-3.5 py-2.5">Email</th>
                    <th className="px-3.5 py-2.5">Subject</th>
                    <th className="px-3.5 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {outreachHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/60">
                      <td className="px-3.5 py-2 text-zinc-500 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-3.5 py-2 font-medium text-zinc-900">
                        {item.businessName}
                      </td>
                      <td className="px-3.5 py-2 font-mono text-[11px] text-zinc-600">
                        {item.recipientEmail}
                      </td>
                      <td className="px-3.5 py-2 text-zinc-700 truncate max-w-xs">
                        {item.subject}
                      </td>
                      <td className="px-3.5 py-2 text-right">
                        {item.status === "sent" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Email sent through Gmail
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200">
                            <AlertTriangle className="h-3 w-3 text-amber-600" />
                            Skipped
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold text-base">
              <Mail className="h-5 w-5 text-zinc-800" />
              <span>Confirm Outreach Dispatch</span>
            </div>

            <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
              You are about to dispatch personalized wholesale inquiries to{" "}
              <strong>
                {hasTestOverride
                  ? `test recipient ${testRecipient.trim()}`
                  : `${eligibleProspects.length} public business email addresses`}
              </strong>
              .
            </p>

            {/* Clear trust statement about Gmail account */}
            <div className="mt-3 rounded border border-blue-100 bg-blue-50/70 p-2.5 text-[11px] text-blue-900">
              Emails will be sent from your connected Gmail account (
              <strong>{gmailUserEmail || "Authorized Gmail User"}</strong>).
            </div>

            {hasTestOverride && (
              <div className="mt-2.5 rounded border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-950 font-medium">
                ⚠️ TEST MODE ACTIVE: All {eligibleProspects.length} message(s) will be redirected and sent to{" "}
                <strong className="font-mono">{testRecipient.trim()}</strong>.
              </div>
            )}

            {!hasTestOverride && unindexedProspects.length > 0 && (
              <div className="mt-2.5 rounded border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900">
                Notice: {unindexedProspects.length} selected business
                {unindexedProspects.length > 1 ? "es do" : " does"} not have a publicly listed email address
                and will be safely skipped.
              </div>
            )}

            <div className="mt-4 rounded-lg bg-zinc-50 border border-zinc-200 p-3 space-y-1 text-xs">
              <div className="text-zinc-500">
                Sender: <span className="font-medium text-zinc-800">{senderName} ({gmailUserEmail || "Authorized Gmail Account"})</span>
              </div>
              <div className="text-zinc-500">
                Recipient:{" "}
                <span className="font-medium text-zinc-800">
                  {hasTestOverride ? (
                    <span className="font-mono text-amber-900 font-semibold">{testRecipient.trim()} (Test Override)</span>
                  ) : (
                    `${eligibleProspects.length} prospect email address(es)`
                  )}
                </span>
              </div>
              <div className="text-zinc-500">
                Subject:{" "}
                <span className="font-medium text-zinc-800">
                  {subjectTemplate.slice(0, 45)}...
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-md border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmails}
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
