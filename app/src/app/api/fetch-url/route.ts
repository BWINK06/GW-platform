import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic URL validation
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only HTTP/HTTPS URLs are supported" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "GW-Platform/1.0 (Knowledge Hub)",
        Accept: "text/html, text/plain, application/json, */*",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();

    let extracted: string;

    if (contentType.includes("text/html")) {
      extracted = extractTextFromHTML(raw);
    } else if (contentType.includes("application/json")) {
      try {
        extracted = JSON.stringify(JSON.parse(raw), null, 2);
      } catch {
        extracted = raw;
      }
    } else {
      // plain text or other — use as-is
      extracted = raw;
    }

    // Truncate to ~50k chars to stay within localStorage limits
    const maxLen = 50000;
    if (extracted.length > maxLen) {
      extracted = extracted.slice(0, maxLen) + "\n\n[Content truncated — original was " + extracted.length + " characters]";
    }

    return NextResponse.json({
      content: extracted,
      title: extractTitle(raw, contentType) || parsed.hostname,
      url,
    });
  } catch (error) {
    console.error("URL fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch URL" },
      { status: 500 }
    );
  }
}

function extractTextFromHTML(html: string): string {
  // Remove script, style, nav, footer, header tags and their content
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "");

  // Convert common block elements to newlines
  text = text
    .replace(/<\/?(h[1-6]|p|div|li|br|tr|blockquote)[^>]*>/gi, "\n")
    .replace(/<\/?(ul|ol|table|thead|tbody)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")  // strip remaining tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")  // collapse extra newlines
    .trim();

  return text;
}

function extractTitle(html: string, contentType: string): string | null {
  if (!contentType.includes("text/html")) return null;
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : null;
}
