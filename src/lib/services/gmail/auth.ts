import { cookies } from "next/headers";
import { encryptSessionData, decryptSessionData } from "./crypto";

export const GMAIL_SESSION_COOKIE = "bf_gmail_session";

export interface GmailTokenSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in ms
  email: string;
}

/**
 * Returns Google OAuth client credentials from environment
 */
export function getOAuthConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

  return { clientId, clientSecret, redirectUri };
}

/**
 * Generates the Google OAuth authorization URL
 */
export function getGoogleOAuthUrl(state: string): string {
  const { clientId, redirectUri } = getOAuthConfig();

  if (!clientId) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID is not configured.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges an authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  email: string;
}> {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured in environment variables.");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error("Token exchange failed:", errorText);
    throw new Error(`Failed to exchange authorization code: ${errorText}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token as string;
  const refreshToken = (tokenData.refresh_token as string) || "";
  const expiresIn = (tokenData.expires_in as number) || 3600;

  // Retrieve user's email address to verify identity and display in UI
  let email = "Connected Gmail Account";
  try {
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (userRes.ok) {
      const userData = await userRes.json();
      if (userData.email) {
        email = userData.email;
      }
    }
  } catch (err) {
    console.warn("Could not retrieve user info email:", err);
  }

  return { accessToken, refreshToken, expiresIn, email };
}

/**
 * Refreshes an expired access token using the stored refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const { clientId, clientSecret } = getOAuthConfig();

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Token refresh failed:", errorText);
    throw new Error(`Failed to refresh Gmail access token: ${errorText}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token as string,
    expiresIn: (data.expires_in as number) || 3600,
  };
}

import type { NextRequest, NextResponse } from "next/server";

/**
 * Reads and decrypts the current Gmail session from httpOnly cookies
 */
export async function getGmailSession(req?: NextRequest): Promise<GmailTokenSession | null> {
  let cookieVal: string | undefined;

  if (req) {
    cookieVal = req.cookies.get(GMAIL_SESSION_COOKIE)?.value;
  } else {
    try {
      const cookieStore = await cookies();
      cookieVal = cookieStore.get(GMAIL_SESSION_COOKIE)?.value;
    } catch {
      // Outside request context
    }
  }

  if (!cookieVal) return null;

  const session = decryptSessionData<GmailTokenSession>(cookieVal);
  if (!session || !session.refreshToken) return null;

  return session;
}

/**
 * Writes the encrypted Gmail session into httpOnly cookies
 */
export async function setGmailSession(
  session: GmailTokenSession,
  res?: NextResponse
): Promise<void> {
  const encrypted = encryptSessionData(session as unknown as Record<string, unknown>);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };

  if (res) {
    res.cookies.set(GMAIL_SESSION_COOKIE, encrypted, cookieOptions);
  } else {
    const cookieStore = await cookies();
    cookieStore.set(GMAIL_SESSION_COOKIE, encrypted, cookieOptions);
  }
}

/**
 * Clears the Gmail session cookie
 */
export async function clearGmailSession(res?: NextResponse): Promise<void> {
  if (res) {
    res.cookies.delete(GMAIL_SESSION_COOKIE);
  } else {
    const cookieStore = await cookies();
    cookieStore.delete(GMAIL_SESSION_COOKIE);
  }
}

/**
 * Gets a guaranteed-valid access token, automatically refreshing if close to expiry
 */
export async function getValidAccessToken(req?: NextRequest): Promise<{
  accessToken: string;
  senderEmail: string;
} | null> {
  const session = await getGmailSession(req);
  if (!session) return null;

  const now = Date.now();
  // If token is valid for more than 60 more seconds, use it directly
  if (session.accessToken && session.expiresAt > now + 60000) {
    return {
      accessToken: session.accessToken,
      senderEmail: session.email,
    };
  }

  // Otherwise, refresh using refresh token
  try {
    const refreshed = await refreshAccessToken(session.refreshToken);
    const updatedSession: GmailTokenSession = {
      ...session,
      accessToken: refreshed.accessToken,
      expiresAt: Date.now() + refreshed.expiresIn * 1000,
    };

    await setGmailSession(updatedSession);

    return {
      accessToken: refreshed.accessToken,
      senderEmail: session.email,
    };
  } catch (err) {
    console.error("Failed to automatically refresh Gmail token:", err);
    return null;
  }
}
