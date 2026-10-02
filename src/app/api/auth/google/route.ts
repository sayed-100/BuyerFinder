import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/services/gmail/auth";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    const authUrl = getGoogleOAuthUrl(state);

    const response = NextResponse.redirect(authUrl);

    // Set state cookie to prevent CSRF during callback
    response.cookies.set("bf_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error("Failed to generate Google OAuth URL:", error);
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(`${origin}/?tab=outreach&auth_error=config_missing`);
  }
}
