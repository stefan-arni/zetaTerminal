export async function POST(request: Request) {
  try {
    const { url } = (await request.json()) as { url: string };

    if (!url || typeof url !== "string") {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic URL validation
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return Response.json({ error: "Invalid URL" }, { status: 400 });
    }

    const res = await fetch(parsed.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ZetaTerminal/1.0; +https://zetaterminal.com)",
        Accept: "text/html,application/xhtml+xml,text/plain",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return Response.json(
        { error: `Failed to fetch: HTTP ${res.status}` },
        { status: 422 }
      );
    }

    const html = await res.text();

    // Extract meaningful text from HTML
    const text = extractText(html);
    const title = extractTitle(html);

    return Response.json({
      title: title || parsed.hostname,
      content: text.slice(0, 15000), // Cap at 15k chars
      url: parsed.toString(),
      hostname: parsed.hostname,
    });
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to scrape URL",
      },
      { status: 500 }
    );
  }
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
}

function extractText(html: string): string {
  let text = html;

  // Remove non-content blocks entirely (NOT header — heroes live there)
  text = text.replace(/<(script|style|noscript|iframe|svg)[^>]*>[\s\S]*?<\/\1>/gi, "");
  text = text.replace(/<(nav|footer)[^>]*>[\s\S]*?<\/\1>/gi, "");
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Preserve heading structure — put each on its own line
  text = text.replace(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, "\n\n$1\n");
  text = text.replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, "\n$1\n");

  // Paragraphs and line breaks → newlines
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // List items → bullet lines
  text = text.replace(/<li[^>]*>/gi, "\n- ");

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ");

  // Normalize whitespace: collapse spaces/tabs but keep meaningful line breaks
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/^ /gm, "");
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}
