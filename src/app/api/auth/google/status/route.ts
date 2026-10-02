import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/services/gmail/auth";

export async function GET(request: NextRequest) {
  try {
    const authData = await getValidAccessToken(request);

    if (!authData) {
      return NextResponse.json({
        isConnected: false,
      });
    }

    return NextResponse.json({
      isConnected: true,
      email: authData.senderEmail,
    });
  } catch (error) {
    console.error("Error checking Gmail connection status:", error);
    return NextResponse.json({
      isConnected: false,
    });
  }
}
