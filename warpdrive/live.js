// live.js — tiny server for /targets.json and a CORS proxy
// run: node live.js   (Node 18+)

import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { URL } from "node:url";

const PORT = 8787;
const server = http.createServer(async (req, res) => {
  // CORS for everything
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, *");
  if (req.method === "OPTIONS") return res.end();

  const u = new URL(req.url, `http://127.0.0.1:${PORT}`);

  // 1) /targets.json (serve local file if present, else sample)
  if (u.pathname === "/targets.json") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
      if (existsSync("./targets.json")) {
        const txt = await readFile("./targets.json", "utf8");
        res.writeHead(200).end(txt);
      } else {
        // sample so the UI always renders
        res.writeHead(200).end(JSON.stringify({
          planets: [
            { name: "Mars",    horizonsId: "499" },
            { name: "Jupiter", horizonsId: "599" }
          ],
          stars: [
            { name: "Sirius", ra: 101.2875, dec: -16.7161 }
          ]
        }));
      }
    } catch (e) {
      res.writeHead(500).end(JSON.stringify({ error: String(e) }));
    }
    return;
  }

  // 2) /proxy?url=<encoded absolute URL>   (GET and POST)
  if (u.pathname === "/proxy") {
    const target = u.searchParams.get("url");
    if (!target || !/^https?:\/\//i.test(target)) {
      res.writeHead(400).end("Missing or invalid ?url=");
      return;
    }
    try {
      // gather body if POST
      let body = undefined;
      if (req.method === "POST") {
        body = await new Promise((resolve, reject) => {
          const chunks = [];
          req.on("data", c => chunks.push(c));
          req.on("end", () => resolve(Buffer.concat(chunks)));
          req.on("error", reject);
        });
      }

      const out = await fetch(target, {
        method: req.method === "POST" ? "POST" : "GET",
        headers: {
          "user-agent": "ftl-nav-console/1.0 (+local-dev)",
          // pass through content-type for POST forms
          ...(req.headers["content-type"]
            ? { "content-type": req.headers["content-type"] }
            : {})
        },
        body
      });

      const buf = Buffer.from(await out.arrayBuffer());
      // Try to keep content-type from the origin
      const ct = out.headers.get("content-type") || "application/octet-stream";
      res.setHeader("Content-Type", ct);
      res.writeHead(out.status);
      res.end(buf);
    } catch (e) {
      res.writeHead(502).end("Proxy fetch failed: " + e.message);
    }
    return;
  }

  // 3) sanity ping
  if (u.pathname === "/ping") {
    res.writeHead(200, { "Content-Type": "text/plain" }).end("pong");
    return;
  }

  res.writeHead(404).end("Not found");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Live server on http://127.0.0.1:${PORT}`);
  console.log(`- /targets.json  (serves local file or sample)`);
  console.log(`- /proxy?url=ENCODED_URL  (GET/POST, CORS open)`);
});
