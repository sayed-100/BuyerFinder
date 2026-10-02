import { NextResponse } from "next/server";
import { clearGmailSession } from "@/lib/services/gmail/auth";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    await clearGmailSession(response);
    return response;
  } catch (error) {
    console.error("Error clearing Gmail session:", error);
    return NextResponse.json({ error: "Failed to disconnect Gmail session" }, { status: 500 });
  }
}
