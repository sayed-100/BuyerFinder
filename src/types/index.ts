export interface Contact {
  email: string | null;
  phone: string | null;
  contactPerson?: string | null;
  contactRole?: string | null;
  hasVerifiedEmail: boolean;
  socialHandles?: {
    instagram?: string;
    linkedin?: string;
  };
}

export interface Prospect {
  id: string;
  businessName: string;
  businessType: string; // e.g. "Boutique Home Decor", "Interior Design Studio", "Furniture & Lifestyle"
  category: string;
  city: string;
  state: string; // US State code e.g. "NY", "CA"
  address: string;
  website: string | null;
  contact: Contact;
  relevanceExplanation: string; // Factual justification based on business profile
  source: string; // e.g. "US Business Registry (Places API)"
  discoveredAt: string;
  selected?: boolean;
}

export interface SearchRequest {
  productCategory: string; // e.g. "Handmade ceramic tableware & vases"
  targetMarket: string; // e.g. "New York, NY"
  businessType?: string; // Optional filter e.g. "Home decor boutique"
  hasEmailOnly?: boolean;
}

export interface SearchResponse {
  query: SearchRequest;
  totalFound: number;
  prospects: Prospect[];
  searchTimestamp: string;
  isMockData: boolean; // Flag to indicate sandbox mock vs live API
}

export interface OutreachRecipient {
  id: string;
  businessName: string;
  recipientEmail: string | null;
  location: string;
  contactPerson?: string | null;
}

export interface EmailRequest {
  recipients: OutreachRecipient[];
  senderName: string;
  senderEmail: string;
  subjectTemplate: string;
  bodyTemplate: string;
  testRecipientOverride?: string | null;
}

export interface EmailDeliveryStatus {
  prospectId: string;
  businessName: string;
  recipientEmail: string;
  status: "sent" | "failed" | "skipped";
  reason?: string;
  sentAt: string;
}

export interface EmailResult {
  batchId: string;
  totalAttempted: number;
  totalSent: number;
  totalFailed: number;
  deliveries: EmailDeliveryStatus[];
}

export interface OutreachRecord {
  id: string;
  batchId: string;
  prospectId: string;
  businessName: string;
  recipientEmail: string;
  subject: string;
  bodyPreview: string;
  status: "sent" | "failed" | "skipped";
  timestamp: string;
}
