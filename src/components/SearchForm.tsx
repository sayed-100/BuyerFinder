"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ArrowRight, Info, MapPin, Tag, Building2 } from "lucide-react";

const PRODUCT_PRESETS = [
  "Handmade ceramic tableware & vases",
  "Handmade wall decor & woven tapestries",
  "Artisan candles & home fragrances",
  "Solid wood accent furniture & decor",
];

const MARKET_PRESETS = [
  "New York, NY",
  "Austin, TX",
  "Los Angeles, CA",
  "Chicago, IL",
];

export function SearchForm() {
  const { searchRequest, setSearchRequest, executeSearch, isSearching } = useApp();
  const [productCategory, setProductCategory] = useState(searchRequest.productCategory);
  const [targetMarket, setTargetMarket] = useState(searchRequest.targetMarket);
  const [businessType, setBusinessType] = useState(searchRequest.businessType || "all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productCategory.trim() || !targetMarket.trim()) return;

    const updated = {
      ...searchRequest,
      productCategory: productCategory.trim(),
      targetMarket: targetMarket.trim(),
      businessType,
    };
    setSearchRequest(updated);
    executeSearch(updated);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
          Find potential retail prospects
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Tell us what you&apos;re selling and where you want to sell it.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Category Input */}
          <div>
            <label
              htmlFor="product-category"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700"
            >
              <Tag className="h-3.5 w-3.5 text-zinc-500" />
              Product / Category
            </label>
            <div className="mt-1.5">
              <input
                id="product-category"
                type="text"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                placeholder="e.g. Handmade ceramic tableware, wall decor, candles..."
                className="w-full rounded-md border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                required
              />
            </div>
            {/* Quick suggestions */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
              <span className="text-[11px] font-medium text-zinc-400">Popular:</span>
              {PRODUCT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setProductCategory(preset)}
                  className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Location & Business Type Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="target-market"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700"
              >
                <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                Target Market (US City, State)
              </label>
              <div className="mt-1.5">
                <input
                  id="target-market"
                  type="text"
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  placeholder="e.g. New York, NY"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                  required
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                <span className="text-[11px] font-medium text-zinc-400">Markets:</span>
                {MARKET_PRESETS.map((market) => (
                  <button
                    key={market}
                    type="button"
                    onClick={() => setTargetMarket(market)}
                    className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100 transition-colors"
                  >
                    {market}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="business-type"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700"
              >
                <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                Business Type <span className="text-[11px] text-zinc-400 lowercase">(optional)</span>
              </label>
              <div className="mt-1.5">
                <select
                  id="business-type"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                >
                  <option value="all">All relevant retail & design businesses</option>
                  <option value="Home Furnishings">Home decor & furnishings stores</option>
                  <option value="Gift & Lifestyle">Independent gift & lifestyle boutiques</option>
                  <option value="Interior Design">Interior design studios & showrooms</option>
                </select>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                Filters by primary commercial registry classification.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
            >
              {isSearching ? (
                <span>Searching business directories...</span>
              ) : (
                <>
                  <span>Find prospects</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Small trust statement */}
        <div className="mt-5 flex items-start gap-2 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
          <p className="leading-relaxed">
            Searches verified commercial listings via Google Places API (New) with public business email enrichment. Results are
            potential prospects, not guaranteed buyers.
          </p>
        </div>
      </div>
    </div>
  );
}
