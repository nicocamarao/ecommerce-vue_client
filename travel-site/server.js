const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 4173);
const ROOT_DIR = __dirname;
const HOTEL_CACHE = new Map();

function logBookingHotel(message, details = "") {
  const stamp = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(`[booking-hotels ${stamp}] ${message}${details ? ` :: ${details}` : ""}`);
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function sendFile(res, absolutePath) {
  const ext = path.extname(absolutePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  fs.readFile(absolutePath, (error, content) => {
    if (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Error interno al leer archivo.");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    res.end(content);
  });
}

function withCors(headers = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...headers
  };
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, withCors({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }));
  res.end(JSON.stringify(payload));
}

function decodeHtmlEntities(value = "") {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function stripTags(value = "") {
  return decodeHtmlEntities(String(value).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function getFirstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

function extractBookingCards(html, destination, country, searchUrl) {
  const cards = [];
  const chunks = [];
  const selectors = [
    /<div[^>]+data-testid="property-card"[\s\S]*?<\/div>\s*<\/div>/gi,
    /<article[^>]+data-testid="property-card"[\s\S]*?<\/article>/gi,
    /<div[^>]+class="[^"]*sr_property_block[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi
  ];
  for (const selector of selectors) {
    const matches = html.match(selector) || [];
    if (matches.length) {
      chunks.push(...matches);
      break;
    }
  }

  const sourceChunks = chunks.length ? chunks : [html];
  for (const chunk of sourceChunks.slice(0, 12)) {
    const title = stripTags(getFirstMatch(chunk, [
      /data-testid="title"[^>]*>([\s\S]*?)<\/span>/i,
      /data-testid="title"[^>]*>([\s\S]*?)<\/div>/i,
      /aria-hidden="false"[^>]*>([\s\S]*?)<\/span>/i,
      /<span[^>]*>([^<]{3,120})<\/span>/i
    ]));
    const price = stripTags(getFirstMatch(chunk, [
      /data-testid="price-and-discounted-price"[^>]*>([\s\S]*?)<\/span>/i,
      /data-testid="price-and-discounted-price"[^>]*>([\s\S]*?)<\/div>/i,
      /(UYU\s?[\d.,]+(?:\s?UYU\s?[\d.,]+)?)/i,
      /([$€£]\s?[\d.,]+)/i
    ]));
    const rating = stripTags(getFirstMatch(chunk, [
      /data-testid="review-score"[\s\S]*?>([\d.,]+)</i,
      /([0-9],[0-9]|\d\.\d|\d,\d)/i
    ]));
    const image = getFirstMatch(chunk, [
      /<img[^>]+src="([^"]+)"/i,
      /<img[^>]+data-src="([^"]+)"/i,
      /<source[^>]+srcset="([^"]+)"/i
    ]);
    const area = stripTags(getFirstMatch(chunk, [
      /data-testid="address"[^>]*>([\s\S]*?)<\/span>/i,
      /<span[^>]*class="[^"]*address[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
      /Mostrar en el mapa/i
    ])) || [destination, country].filter(Boolean).join(", ");

    if (!title && !price) continue;
    cards.push({
      title: title || "Hotel",
      price: price || "",
      rating: rating || "",
      image: image ? decodeHtmlEntities(image) : "",
      area,
      url: searchUrl.toString(),
      raw: {
        title,
        price,
        rating,
        area
      }
    });
    if (cards.length >= 10) break;
  }
  return cards;
}

function fetchBookingHtml(url) {
  const output = execFileSync("curl", [
    "-L",
    "-m",
    "25",
    "-A",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
    "--compressed",
    url
  ], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
  return output;
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

  if (req.method === "OPTIONS") {
    res.writeHead(204, withCors());
    res.end();
    return;
  }

  if (urlPath === "/api/booking-hotels") {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
    const key = requestUrl.searchParams.toString() || "default";
    const cached = HOTEL_CACHE.get(key);
    if (cached && Date.now() - cached.at < 15 * 60 * 1000) {
      logBookingHotel("cache-hit", key);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify(cached.payload));
      return;
    }

    const destination = requestUrl.searchParams.get("destination") || "";
    const country = requestUrl.searchParams.get("country") || "";
    const checkin = requestUrl.searchParams.get("checkin") || "";
    const checkout = requestUrl.searchParams.get("checkout") || "";
    const adults = requestUrl.searchParams.get("adults") || "2";
    const children = requestUrl.searchParams.get("children") || "0";
    const rooms = requestUrl.searchParams.get("rooms") || "1";
    const destId = requestUrl.searchParams.get("destId") || "";

    const searchUrl = new URL("https://www.booking.com/searchresults.html");
    if (destination) searchUrl.searchParams.set("ss", [destination, country].filter(Boolean).join(", "));
    if (checkin) searchUrl.searchParams.set("checkin", checkin);
    if (checkout) searchUrl.searchParams.set("checkout", checkout);
    searchUrl.searchParams.set("group_adults", adults);
    searchUrl.searchParams.set("group_children", children);
    searchUrl.searchParams.set("no_rooms", rooms);
    if (destId) searchUrl.searchParams.set("dest_id", destId);

    const finish = (payload) => {
      HOTEL_CACHE.set(key, { at: Date.now(), payload });
      logBookingHotel(payload.fetched ? "fetched" : "fallback", `${key} | results=${payload.hotels?.length || 0}`);
      writeJson(res, 200, payload);
    };

    (async () => {
      try {
        logBookingHotel("fetch-start", key);
        const html = fetchBookingHtml(searchUrl.toString());
        const cards = extractBookingCards(html, destination, country, searchUrl);
        finish({ source: "booking", fetched: cards.length > 0, url: searchUrl.toString(), hotels: cards });
      } catch (error) {
        logBookingHotel("error", `${key} | ${String(error?.message || error)}`);
        finish({ source: "booking", fetched: false, url: searchUrl.toString(), hotels: [], error: String(error?.message || error) });
      }
    })();
    return;
  }

  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.join(ROOT_DIR, normalizedPath);

  if (!absolutePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, withCors({ "Content-Type": "text/plain; charset=utf-8" }));
    res.end("Acceso denegado.");
    return;
  }

  fs.stat(absolutePath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(res, absolutePath);
      return;
    }

    const fallbackPath = path.join(ROOT_DIR, "index.html");
    fs.stat(fallbackPath, (fallbackError, fallbackStats) => {
      if (fallbackError || !fallbackStats.isFile()) {
        res.writeHead(404, withCors({ "Content-Type": "text/plain; charset=utf-8" }));
        res.end("No encontrado.");
        return;
      }
      sendFile(res, fallbackPath);
    });
  });
});

server.listen(PORT, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`travel-site listo en http://localhost:${PORT}`);
});
