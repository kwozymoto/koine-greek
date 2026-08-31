/* Koine Greek — sync endpoint (Cloudflare Worker + KV).

   The client derives an id by SHA-256-hashing the user's private sync
   phrase, so the phrase itself never leaves the device; the hash acts
   as both address and secret. The worker is a dumb store:

     GET  /sync/<64-hex>  -> stored envelope JSON, 404 if none
     PUT  /sync/<64-hex>  -> store envelope JSON (size-capped)

   All merging happens client-side. No other state, no logs of content. */

const ORIGIN = "https://kwozymoto.github.io";
const MAX_BYTES = 300000;

export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": ORIGIN,
      "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });

    const m = new URL(req.url).pathname.match(/^\/sync\/([a-f0-9]{64})$/);
    if (!m) return new Response("not found", { status: 404, headers: cors });
    const key = "v1:" + m[1];

    if (req.method === "GET") {
      const v = await env.KOINE_SYNC.get(key);
      if (v === null) return new Response('{"none":true}', { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
      return new Response(v, { headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (req.method === "PUT") {
      const body = await req.text();
      if (body.length > MAX_BYTES) return new Response("too large", { status: 413, headers: cors });
      try {
        const j = JSON.parse(body);
        if (typeof j !== "object" || !j || typeof j.ts !== "number" || typeof j.data !== "object")
          throw new Error("shape");
      } catch {
        return new Response("bad envelope", { status: 400, headers: cors });
      }
      await env.KOINE_SYNC.put(key, body);
      return new Response('{"ok":true}', { headers: { ...cors, "Content-Type": "application/json" } });
    }

    return new Response("method not allowed", { status: 405, headers: cors });
  },
};
