import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname, sep } from "node:path";
const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const port = Number(process.env.PORT || 8771);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};
createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (pathname === "/" || pathname === "/preview/" || pathname === "/preview")
      pathname = "/preview/index.html";
    const path = resolve(root, "." + pathname);
    if (!path.startsWith(root + sep) && path !== root)
      throw new Error("Invalid path");
    if (
      !["/preview/", "/custom_components/coffee_tracker/www/"].some((prefix) =>
        pathname.startsWith(prefix),
      )
    )
      throw new Error("Not a preview asset");
    res.writeHead(200, {
      "Content-Type": types[extname(path)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(await readFile(path));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Coffee Tracker preview: http://127.0.0.1:${port}/preview/`),
);
