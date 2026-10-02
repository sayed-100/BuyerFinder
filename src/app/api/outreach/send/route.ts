import { NextRequest, NextResponse } from "next/server";
import { EmailRequest, EmailResult, EmailDeliveryStatus } from "@/types";
import { getValidAccessToken } from "@/lib/services/gmail/auth";
import { sendGmailMessage } from "@/lib/services/gmail/send";

// RFC 5322 compliant simplified email regex for server-side validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EmailRequest;

    if (!body.recipients || !Array.isArray(body.recipients) || body.recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients specified for outreach." },
        { status: 400 }
      );
    }

    if (!body.senderName || body.senderName.trim().length === 0) {
      return NextResponse.json(
        { error: "Sender name is required." },
        { status: 400 }
      );
    }

    if (!body.subjectTemplate || !body.bodyTemplate) {
      return NextResponse.json(
        { error: "Email subject and body are required." },
        { status: 400 }
      );
    }

    // Verify Gmail connection
    const authData = await getValidAccessToken(request);
    const isRealApiEnabled = process.env.ENABLE_REAL_APIS === "true";

    // In live mode, Gmail authentication is strictly required
    if (isRealApiEnabled && !authData) {
      return NextResponse.json(
        {
          error:
            "Your Gmail account is not connected. Please click 'Connect Gmail' to authorize email sending before dispatching.",
        },
        { status: 401 }
      );
    }

    // In development mode, support optional test recipient override (strictly disabled in production)
    const isDevMode = process.env.NODE_ENV !== "production";
    const testRecipientOverride =
      isDevMode &&
      typeof body.testRecipientOverride === "string" &&
      body.testRecipientOverride.trim().length > 0 &&
      EMAIL_REGEX.test(body.testRecipientOverride.trim())
        ? body.testRecipientOverride.trim()
        : null;

    // Block sending if no recipient in the batch has a valid email address
    const hasAtLeastOneRecipient = body.recipients.some((r) => {
      const email = testRecipientOverride || r.recipientEmail?.trim();
      return email && email !== "N/A" && EMAIL_REGEX.test(email);
    });

    if (!hasAtLeastOneRecipient) {
      return NextResponse.json(
        { error: "No valid recipient email addresses found in the selected batch." },
        { status: 400 }
      );
    }

    const batchId = `batch-${Date.now().toString(36)}`;
    const deliveries: EmailDeliveryStatus[] = [];

    // Process each target prospect recipient
    for (const recipient of body.recipients) {
      const prospectId = recipient.id || `recipient-${Math.random().toString(36).slice(2, 7)}`;
      const businessName = recipient.businessName?.trim() || "Prospective Business";
      const rawEmail = recipient.recipientEmail?.trim();
      const location = recipient.location || "";
      const contactPerson = recipient.contactPerson?.trim() || "Store Manager";

      // In development mode with test recipient active, override target recipient email
      const targetEmail = testRecipientOverride || rawEmail;

      // 1. Check if recipient email was provided
      if (!targetEmail || targetEmail === "N/A") {
        deliveries.push({
          prospectId,
          businessName,
          recipientEmail: "N/A",
          status: "skipped",
          reason: "No public email address available for this business",
          sentAt: new Date().toISOString(),
        });
        continue;
      }

      // 2. Server-side recipient email format validation
      if (!EMAIL_REGEX.test(targetEmail)) {
        deliveries.push({
          prospectId,
          businessName,
          recipientEmail: targetEmail,
          status: "failed",
          reason: "Invalid email address format",
          sentAt: new Date().toISOString(),
        });
        continue;
      }

      // 3. Interpolate dynamic template tokens
      const personalizedSubject = body.subjectTemplate
        .replace(/{{businessName}}/g, businessName)
        .replace(/{{location}}/g, location)
        .replace(/{{sellerName}}/g, body.senderName)
        .replace(/{{contactPerson}}/g, contactPerson);

      const personalizedBody = body.bodyTemplate
        .replace(/{{businessName}}/g, businessName)
        .replace(/{{location}}/g, location)
        .replace(/{{sellerName}}/g, body.senderName)
        .replace(/{{contactPerson}}/g, contactPerson);

      // 4. Send via Gmail API if authenticated
      if (authData) {
        try {
          const sendResult = await sendGmailMessage({
            accessToken: authData.accessToken,
            fromName: body.senderName,
            fromEmail: authData.senderEmail,
            to: targetEmail,
            subject: personalizedSubject,
            body: personalizedBody,
          });

          deliveries.push({
            prospectId,
            businessName,
            recipientEmail: targetEmail,
            status: "sent",
            reason: testRecipientOverride
              ? `Email sent through Gmail to test recipient (${testRecipientOverride})`
              : `Email sent through Gmail (ID: ${sendResult.messageId})`,
            sentAt: new Date().toISOString(),
          });
        } catch (gmailErr: unknown) {
          const errMessage =
            gmailErr instanceof Error ? gmailErr.message : "Gmail API dispatch error";
          console.error(`Failed to send email to ${targetEmail} via Gmail API:`, gmailErr);

          deliveries.push({
            prospectId,
            businessName,
            recipientEmail: targetEmail,
            status: "failed",
            reason: errMessage,
            sentAt: new Date().toISOString(),
          });
        }
      } else {
        // Mock / Sandbox mode fallback when ENABLE_REAL_APIS !== "true"
        deliveries.push({
          prospectId,
          businessName,
          recipientEmail: targetEmail,
          status: "sent",
          reason: testRecipientOverride
            ? `Simulated dispatch to test recipient (${testRecipientOverride})`
            : "Simulated dispatch (Sandbox Mode)",
          sentAt: new Date().toISOString(),
        });
      }
    }

    const totalSent = deliveries.filter((d) => d.status === "sent").length;
    const totalFailed = deliveries.filter((d) => d.status !== "sent").length;

    const result: EmailResult = {
      batchId,
      totalAttempted: body.recipients.length,
      totalSent,
      totalFailed,
      deliveries,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing outreach email request:", error);
    return NextResponse.json(
      { error: "Failed to process outreach batch" },
      { status: 500 }
    );
  }
}
