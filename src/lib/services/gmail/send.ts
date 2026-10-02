export interface SendGmailMessageParams {
  accessToken: string;
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
}

export interface SendGmailMessageResult {
  messageId: string;
  threadId?: string;
}

/**
 * Encodes a header string using UTF-8 MIME encoded-word format if non-ASCII characters exist
 */
function encodeMimeHeader(text: string): string {
  // If text contains non-ASCII characters, encode with =?UTF-8?B?...?=
  if (/[^\x00-\x7F]/.test(text)) {
    return `=?UTF-8?B?${Buffer.from(text, "utf-8").toString("base64")}?=`;
  }
  return text;
}

/**
 * Constructs an RFC 2822 compliant MIME email string
 */
export function buildRfc2822Message(
  fromName: string,
  fromEmail: string,
  to: string,
  subject: string,
  body: string
): string {
  const cleanFromName = fromName.replace(/[<>"\r\n]/g, "").trim();
  const cleanFromEmail = fromEmail.trim();
  const cleanTo = to.trim();

  const fromHeader = cleanFromName
    ? `From: "${encodeMimeHeader(cleanFromName)}" <${cleanFromEmail}>`
    : `From: <${cleanFromEmail}>`;

  const lines = [
    fromHeader,
    `To: <${cleanTo}>`,
    `Subject: ${encodeMimeHeader(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    body,
  ];

  return lines.join("\r\n");
}

/**
 * Dispatches an email message through the Gmail API users.messages.send endpoint
 */
export async function sendGmailMessage({
  accessToken,
  fromName,
  fromEmail,
  to,
  subject,
  body,
}: SendGmailMessageParams): Promise<SendGmailMessageResult> {
  const rfc2822Raw = buildRfc2822Message(fromName, fromEmail, to, subject, body);

  // Encode as URL-safe Base64
  const rawBase64Url = Buffer.from(rfc2822Raw, "utf-8").toString("base64url");

  const endpoint = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: rawBase64Url,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gmail API send failed with HTTP ${response.status}:`, errorText);

    let parsedError = `Gmail API error (status ${response.status})`;
    try {
      const errJson = JSON.parse(errorText);
      if (errJson?.error?.message) {
        parsedError = errJson.error.message;
      }
    } catch {
      // Fallback
    }

    throw new Error(parsedError);
  }

  const data = (await response.json()) as { id: string; threadId: string };
  return {
    messageId: data.id,
    threadId: data.threadId,
  };
}
