"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Prospect, SearchRequest, SearchResponse, OutreachRecord } from "@/types";
import { DEVELOPMENT_ONLY_MOCK_PROSPECTS } from "@/lib/mockData";

interface AppContextType {
  activeTab: "discover" | "prospects" | "outreach";
  setActiveTab: (tab: "discover" | "prospects" | "outreach") => void;
  searchRequest: SearchRequest;
  setSearchRequest: React.Dispatch<React.SetStateAction<SearchRequest>>;
  searchResults: Prospect[];
  hasSearched: boolean;
  isSearching: boolean;
  searchLoadingStep: number;
  isCurrentResultsMock: boolean;
  searchError: string | null;
  clearSearchError: () => void;
  savedProspects: Prospect[];
  selectedProspectIds: string[];
  toggleProspectSelection: (prospect: Prospect) => void;
  removeSavedProspect: (id: string) => void;
  clearAllSavedProspects: () => void;
  selectAllResults: () => void;
  deselectAllResults: () => void;
  selectedDrawerProspect: Prospect | null;
  openDrawer: (prospect: Prospect) => void;
  closeDrawer: () => void;
  executeSearch: (request?: SearchRequest) => Promise<void>;
  outreachHistory: OutreachRecord[];
  addOutreachRecords: (records: OutreachRecord[]) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  isGmailConnected: boolean;
  gmailUserEmail: string | null;
  refreshGmailStatus: () => Promise<void>;
  disconnectGmail: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SEARCH_REQUEST: SearchRequest = {
  productCategory: "Handmade ceramic tableware & vases",
  targetMarket: "New York, NY",
  businessType: "all",
  hasEmailOnly: false,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<"discover" | "prospects" | "outreach">("discover");
  const [searchRequest, setSearchRequest] = useState<SearchRequest>(INITIAL_SEARCH_REQUEST);
  const [searchResults, setSearchResults] = useState<Prospect[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchLoadingStep, setSearchLoadingStep] = useState<number>(0);
  const [isCurrentResultsMock, setIsCurrentResultsMock] = useState<boolean>(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savedProspects, setSavedProspects] = useState<Prospect[]>([]);
  const [selectedDrawerProspect, setSelectedDrawerProspect] = useState<Prospect | null>(null);
  const [outreachHistory, setOutreachHistory] = useState<OutreachRecord[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isGmailConnected, setIsGmailConnected] = useState<boolean>(false);
  const [gmailUserEmail, setGmailUserEmail] = useState<string | null>(null);

  const refreshGmailStatus = async () => {
    try {
      const res = await fetch("/api/auth/google/status");
      if (res.ok) {
        const data = await res.json();
        setIsGmailConnected(Boolean(data.isConnected));
        setGmailUserEmail(data.email || null);
      }
    } catch {
      // Ignore
    }
  };

  const disconnectGmail = async () => {
    try {
      await fetch("/api/auth/google/disconnect", { method: "POST" });
      setIsGmailConnected(false);
      setGmailUserEmail(null);
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  useEffect(() => {
    refreshGmailStatus();
  }, []);

  // Derived selected IDs for fast lookup
  const selectedProspectIds = React.useMemo(
    () => savedProspects.map((p) => p.id),
    [savedProspects]
  );

  // Restore saved prospects & history from localStorage if available
  useEffect(() => {
    try {
      const storedProspects = localStorage.getItem("buyerfinder_saved_prospects");
      if (storedProspects) {
        const parsed = JSON.parse(storedProspects) as Prospect[];
        if (Array.isArray(parsed)) {
          setSavedProspects(parsed);
        }
      }
      const savedHistory = localStorage.getItem("buyerfinder_outreach_history");
      if (savedHistory) {
        setOutreachHistory(JSON.parse(savedHistory));
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  // Persist saved prospects
  useEffect(() => {
    try {
      localStorage.setItem("buyerfinder_saved_prospects", JSON.stringify(savedProspects));
    } catch {
      // Ignore
    }
  }, [savedProspects]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem("buyerfinder_outreach_history", JSON.stringify(outreachHistory));
    } catch {
      // Ignore
    }
  }, [outreachHistory]);

  const toggleProspectSelection = (prospect: Prospect) => {
    setSavedProspects((prev) => {
      const exists = prev.some((p) => p.id === prospect.id);
      if (exists) {
        return prev.filter((p) => p.id !== prospect.id);
      } else {
        return [...prev, prospect];
      }
    });
  };

  const removeSavedProspect = (id: string) => {
    setSavedProspects((prev) => prev.filter((p) => p.id !== id));
  };

  const clearAllSavedProspects = () => {
    setSavedProspects([]);
  };

  const selectAllResults = () => {
    setSavedProspects((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const toAdd = searchResults.filter((p) => !existingIds.has(p.id));
      return [...prev, ...toAdd];
    });
  };

  const deselectAllResults = () => {
    const searchIds = new Set(searchResults.map((p) => p.id));
    setSavedProspects((prev) => prev.filter((p) => !searchIds.has(p.id)));
  };

  const openDrawer = (prospect: Prospect) => {
    setSelectedDrawerProspect(prospect);
  };

  const closeDrawer = () => {
    setSelectedDrawerProspect(null);
  };

  const executeSearch = async (overrideRequest?: SearchRequest) => {
    const req = overrideRequest || searchRequest;
    setIsSearching(true);
    setSearchLoadingStep(1);

    // Realistic multi-step discovery indicator
    await new Promise((resolve) => setTimeout(resolve, 380));
    setSearchLoadingStep(2);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setSearchLoadingStep(3);
    await new Promise((resolve) => setTimeout(resolve, 370));

    try {
      const res = await fetch("/api/prospects/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        if (errorJson && typeof errorJson.isMockData === "boolean") {
          setIsCurrentResultsMock(errorJson.isMockData);
        }
        const errMsg = errorJson?.details || errorJson?.error || `Search request failed with HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      const data = (await res.json()) as SearchResponse;
      setSearchResults(data.prospects);
      setIsCurrentResultsMock(data.isMockData);
      setSearchError(null);
      setHasSearched(true);
      setActiveTab("discover");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to execute search";
      console.error("Business discovery search error:", errorMessage);
      setSearchError(errorMessage);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
      setSearchLoadingStep(0);
    }
  };

  const clearSearchError = () => {
    setSearchError(null);
  };

  const addOutreachRecords = (records: OutreachRecord[]) => {
    setOutreachHistory((prev) => [...records, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchRequest,
        setSearchRequest,
        searchResults,
        hasSearched,
        isSearching,
        searchLoadingStep,
        isCurrentResultsMock,
        searchError,
        clearSearchError,
        savedProspects,
        selectedProspectIds,
        toggleProspectSelection,
        removeSavedProspect,
        clearAllSavedProspects,
        selectAllResults,
        deselectAllResults,
        selectedDrawerProspect,
        openDrawer,
        closeDrawer,
        executeSearch,
        outreachHistory,
        addOutreachRecords,
        isHelpOpen,
        setIsHelpOpen,
        isGmailConnected,
        gmailUserEmail,
        refreshGmailStatus,
        disconnectGmail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
