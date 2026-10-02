import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, setGmailSession } from "@/lib/services/gmail/auth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle user cancellation or OAuth error
  if (error) {
    console.warn("Google OAuth callback error:", error);
    return NextResponse.redirect(
      `${origin}/?tab=outreach&auth_error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?tab=outreach&auth_error=missing_code`);
  }

  // Validate state
  const stateCookie = request.cookies.get("bf_oauth_state")?.value;
  if (!stateCookie || stateCookie !== state) {
    console.warn("OAuth state mismatch or expired state cookie.");
    return NextResponse.redirect(`${origin}/?tab=outreach&auth_error=state_mismatch`);
  }

  try {
    const { accessToken, refreshToken, expiresIn, email } = await exchangeCodeForTokens(code);

    const expiresAt = Date.now() + expiresIn * 1000;

    const response = NextResponse.redirect(`${origin}/?tab=outreach&auth_success=true`);

    await setGmailSession(
      {
        accessToken,
        refreshToken,
        expiresAt,
        email,
      },
      response
    );

    // Clear state cookie
    response.cookies.delete("bf_oauth_state");

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Exchange failed";
    console.error("Failed to complete OAuth callback:", err);
    return NextResponse.redirect(
      `${origin}/?tab=outreach&auth_error=${encodeURIComponent(errorMsg)}`
    );
  }
}
