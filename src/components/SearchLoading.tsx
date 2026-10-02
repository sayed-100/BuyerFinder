"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Loader2, CheckCircle2, Search, Building, MailCheck } from "lucide-react";

export function SearchLoading() {
  const { searchLoadingStep, searchRequest } = useApp();

  const steps = [
    {
      step: 1,
      label: `Finding businesses in ${searchRequest.targetMarket || "target market"}...`,
      subtext: "Querying commercial registries and verified US business directories",
      icon: Search,
    },
    {
      step: 2,
      label: `Searching relevant categories for "${searchRequest.productCategory || "home decor"}"...`,
      subtext: "Filtering boutiques, interior design showrooms, and lifestyle retailers",
      icon: Building,
    },
    {
      step: 3,
      label: "Checking available business contact information...",
      subtext: "Indexing public contact emails, phone numbers, and web domains",
      icon: MailCheck,
    },
  ];

  return (
    <div className="mx-auto my-12 max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
      <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 text-zinc-900">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-800" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Querying Business APIs</h2>
          <p className="text-xs text-zinc-500">Live discovery in progress</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {steps.map(({ step, label, subtext, icon: Icon }) => {
          const isComplete = searchLoadingStep > step;
          const isCurrent = searchLoadingStep === step;

          return (
            <div key={step} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-zinc-300" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-xs font-medium ${
                    isCurrent
                      ? "text-zinc-900 font-semibold"
                      : isComplete
                      ? "text-zinc-700"
                      : "text-zinc-400"
                  }`}
                >
                  {label}
                </p>
                {isCurrent && <p className="text-[11px] text-zinc-500 mt-0.5">{subtext}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
