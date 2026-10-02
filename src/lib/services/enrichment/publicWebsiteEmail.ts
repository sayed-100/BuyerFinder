import { Prospect } from "@/types";

// Common invalid or tracker/platform domains to ignore
const IGNORED_DOMAINS = new Set([
  "example.com",
  "example.org",
  "domain.com",
  "email.com",
  "sentry.io",
  "sentry.wixpress.com",
  "wix.com",
  "wixpress.com",
  "squarespace.com",
  "shopify.com",
  "myshopify.com",
  "google.com",
  "facebook.com",
  "instagram.com",
  "cloudflare.com",
  "schema.org",
  "gravatar.com",
  "wordpress.org",
  "wordpress.com",
]);

// Ignored extensions often mistakenly matched by regex on asset URLs
const IGNORED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp", "js", "css"]);

/**
 * Validates that the URL uses HTTP/HTTPS and is not a private/local IP (SSRF protection)
 */
export function isSafePublicUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Block localhost, internal domains, and metadata endpoints
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      host.endsWith(".lan") ||
      host === "metadata.google.internal" ||
      host === "169.254.169.254"
    ) {
      return false;
    }

    // Block IPv4 private/reserved blocks
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = host.match(ipv4Regex);
    if (ipMatch) {
      const oct1 = Number(ipMatch[1]);
      const oct2 = Number(ipMatch[2]);

      if (
        oct1 === 10 || // 10.0.0.0/8
        oct1 === 127 || // 127.0.0.0/8 loopback
        oct1 === 0 || // 0.0.0.0/8
        (oct1 === 172 && oct2 >= 16 && oct2 <= 31) || // 172.16.0.0/12
        (oct1 === 192 && oct2 === 168) || // 192.168.0.0/16
        (oct1 === 169 && oct2 === 254) // 169.254.0.0/16 link-local
      ) {
        return false;
      }
    }

    // Must have at least one dot in host
    if (!host.includes(".")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes and extracts valid, publicly displayed email candidates from raw HTML
 */
export function extractEmailsFromHtml(html: string, targetDomain?: string): string[] {
  if (!html || typeof html !== "string") return [];

  const foundEmails = new Set<string>();

  // 1. Check mailto: links (highest accuracy)
  const mailtoRegex = /href=["']mailto:([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)(?:\?[^"']*)?["']/gi;
  let mailtoMatch: RegExpExecArray | null;
  while ((mailtoMatch = mailtoRegex.exec(html)) !== null) {
    if (mailtoMatch[1]) {
      const email = mailtoMatch[1].toLowerCase().trim();
      if (isValidBusinessEmail(email)) {
        foundEmails.add(email);
      }
    }
  }

  // 2. Check general text body emails
  const bodyEmailRegex = /\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+\b/g;
  const matches = html.match(bodyEmailRegex) || [];
  for (const m of matches) {
    const email = m.toLowerCase().trim();
    if (isValidBusinessEmail(email)) {
      foundEmails.add(email);
    }
  }

  const emailsList = Array.from(foundEmails);

  // If a target domain is known, prioritize emails matching the business domain
  if (targetDomain && emailsList.length > 1) {
    const cleanDomain = targetDomain.replace(/^www\./, "").toLowerCase();
    emailsList.sort((a, b) => {
      const aMatches = a.endsWith(`@${cleanDomain}`) || a.includes(cleanDomain);
      const bMatches = b.endsWith(`@${cleanDomain}`) || b.includes(cleanDomain);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  }

  return emailsList;
}

/**
 * Validates that an extracted email is not an asset, template dummy, or platform tracker
 */
function isValidBusinessEmail(email: string): boolean {
  if (!email || email.length > 100 || email.length < 5) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;

  // Check local part
  if (!local || local.length > 64) return false;
  if (local === "yourname" || local === "user" || local === "test" || local === "name") {
    return false;
  }

  // Check domain
  if (!domain || !domain.includes(".")) return false;
  if (IGNORED_DOMAINS.has(domain)) return false;

  // Check domain extension
  const ext = domain.split(".").pop();
  if (!ext || IGNORED_EXTENSIONS.has(ext)) return false;

  return true;
}

/**
 * Fetches a single page with strict timeout and character limits
 */
async function fetchPageContent(url: string, timeoutMs: number = 2500): Promise<string | null> {
  if (!isSafePublicUrl(url)) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BuyerFinder/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return null;
    }

    // Read up to 400KB of content to avoid memory issues
    const text = await response.text();
    return text.slice(0, 400000);
  } catch {
    // Gracefully handle timeout, abort, or network errors
    return null;
  }
}

/**
 * Attempts to discover a publicly listed business email for a given website URL
 */
export async function discoverPublicBusinessEmail(
  websiteUrl: string | null
): Promise<string | null> {
  if (!websiteUrl || typeof websiteUrl !== "string") return null;

  const cleanUrl = websiteUrl.trim();
  if (!isSafePublicUrl(cleanUrl)) return null;

  let parsed: URL;
  try {
    parsed = new URL(cleanUrl);
  } catch {
    return null;
  }

  const baseOrigin = parsed.origin;
  const targetDomain = parsed.hostname;

  // 1. Fetch homepage
  const homepageHtml = await fetchPageContent(baseOrigin, 2500);
  if (homepageHtml) {
    const emails = extractEmailsFromHtml(homepageHtml, targetDomain);
    if (emails.length > 0) {
      return emails[0];
    }
  }

  // 2. If no email on homepage, check common contact page paths
  const contactPaths = ["/contact", "/contact-us", "/about", "/about-us"];
  for (const path of contactPaths) {
    const contactUrl = `${baseOrigin}${path}`;
    const pageHtml = await fetchPageContent(contactUrl, 1800);
    if (pageHtml) {
      const emails = extractEmailsFromHtml(pageHtml, targetDomain);
      if (emails.length > 0) {
        return emails[0];
      }
    }
  }

  return null;
}

/**
 * Enriches an array of prospects in parallel using Promise.allSettled()
 * Guaranteed never to fail the search if enrichment for one or more prospects fails or times out.
 */
export async function enrichProspectsWithPublicEmails(
  prospects: Prospect[],
  concurrencyLimit: number = 15
): Promise<Prospect[]> {
  if (!prospects || prospects.length === 0) return [];

  // Limit enrichment to the first N prospects to maintain snappy performance
  const targetBatch = prospects.slice(0, concurrencyLimit);
  const remaining = prospects.slice(concurrencyLimit);

  const enrichmentPromises = targetBatch.map(async (prospect): Promise<Prospect> => {
    // If prospect has no website, return as-is
    if (!prospect.website) {
      return {
        ...prospect,
        contact: {
          ...prospect.contact,
          email: null,
          hasVerifiedEmail: false,
        },
      };
    }

    try {
      const discoveredEmail = await discoverPublicBusinessEmail(prospect.website);

      if (discoveredEmail) {
        return {
          ...prospect,
          contact: {
            ...prospect.contact,
            email: discoveredEmail,
            hasVerifiedEmail: true, // Indicates genuine public business email found
          },
        };
      }

      return {
        ...prospect,
        contact: {
          ...prospect.contact,
          email: null,
          hasVerifiedEmail: false,
        },
      };
    } catch (err) {
      // Individual site error must never crash search
      console.warn(`Enrichment error for prospect ${prospect.id} (${prospect.website}):`, err);
      return {
        ...prospect,
        contact: {
          ...prospect.contact,
          email: null,
          hasVerifiedEmail: false,
        },
      };
    }
  });

  const results = await Promise.allSettled(enrichmentPromises);

  const enrichedBatch: Prospect[] = results.map((res, index) => {
    if (res.status === "fulfilled") {
      return res.value;
    }
    // Fallback if rejected
    return targetBatch[index];
  });

  return [...enrichedBatch, ...remaining];
}
