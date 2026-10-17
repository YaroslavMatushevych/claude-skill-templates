// Shared wrapper for the Vercel functions. Hosted mode: no disk writes outside a temp folder, no local files, no server-side URL fetch.
import { UserError } from "../scripts/lib.mjs";
import { createService, LIMITS } from "../scripts/service.mjs";

export const service = createService({ hosted: true });

export function handle(method, run) {
  return async (req, res) => {
    res.setHeader("cache-control", "no-store");
    res.setHeader("x-content-type-options", "nosniff");
    try {
      if (req.method !== method) {
        res.setHeader("allow", method);
        return res.status(405).json({ error: "Method not allowed." });
      }
      if (method === "POST") {
        // Same-origin only, so other sites cannot use this API from a visitor's browser.
        const origin = req.headers.origin;
        if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({ error: "Wrong origin." });
        if (Number(req.headers["content-length"] ?? 0) > LIMITS.body) return res.status(413).json({ error: "The request is too large." });
      }
      return res.status(200).json(await run(req.body));
    } catch (e) {
      if (e instanceof UserError) return res.status(400).json({ error: e.message });
      console.error(e);
      return res.status(500).json({ error: "Something went wrong." });
    }
  };
}
