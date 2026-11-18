const corsHeaders = (origin, allowed) => ({
  "Access-Control-Allow-Origin": origin === allowed ? origin : allowed,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
});

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN || "https://bthn1.github.io";
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, allowedOrigin);
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (origin && origin !== allowedOrigin) return Response.json({ error: "Origin not allowed" }, { status: 403, headers: cors });
    if (new URL(request.url).pathname !== "/chat" || request.method !== "POST") return Response.json({ error: "Not found" }, { status: 404, headers: cors });
    if (!env.OPENAI_API_KEY) return Response.json({ error: "AI service is not configured" }, { status: 503, headers: cors });
    try {
      const body = await request.json();
      const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
      if (!messages.length || messages.some(m => !["user","assistant"].includes(m.role) || typeof m.content !== "string" || m.content.length > 2000)) {
        return Response.json({ error: "Invalid messages" }, { status: 400, headers: cors });
      }
      const language = String(body.language || "tr").slice(0, 8);
      const instructions = "You are NextDNS Panel's helpful technical assistant. Answer in the user's selected language (" + language + "). Explain NextDNS, DNS, privacy, dashboard navigation and troubleshooting clearly. Never claim you can see or change the user's live NextDNS account. Never ask for API keys, passwords, WireGuard private keys, or other secrets. Do not request or expose personal DNS logs. For changes to DNS settings, explain the steps and ask the user to perform them in the panel. Be concise and age-appropriate.";
      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Authorization": "Bearer " + env.OPENAI_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-4.1-mini",
          instructions,
          input: messages.map(m => ({ role: m.role, content: [{ type: "input_text", text: m.content }] })),
          max_output_tokens: 700
        })
      });
      const result = await upstream.json();
      if (!upstream.ok) return Response.json({ error: "OpenAI request failed", detail: result.error?.message || "Upstream error" }, { status: 502, headers: cors });
      const reply = (result.output || []).flatMap(item => item.content || []).filter(part => part.type === "output_text").map(part => part.text).join("\n");
      return Response.json({ reply }, { headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
    } catch {
      return Response.json({ error: "Invalid request" }, { status: 400, headers: cors });
    }
  }
};