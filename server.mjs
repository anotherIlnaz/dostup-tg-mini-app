import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const rootDir = join(process.cwd(), "public");
const port = Number(process.env.PORT || 5174);

const mimeByExt = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function toLocalPath(urlPath) {
  const path = urlPath === "/" ? "/index.html" : urlPath;
  const safe = normalize(path).replace(/^(\.\.(\/|\\|$))+/, "");
  return join(rootDir, safe);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const filePath = toLocalPath(url.pathname);
    const body = await readFile(filePath);
    const contentType = mimeByExt[extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`tg-mini-app: http://localhost:${port}`);
});
