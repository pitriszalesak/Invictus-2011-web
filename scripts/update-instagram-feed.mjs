import { readFile, writeFile } from "node:fs/promises";

const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
if (!token) {
  throw new Error("Chybí proměnná INSTAGRAM_ACCESS_TOKEN.");
}

const endpoint = new URL("https://graph.instagram.com/me/media");
endpoint.searchParams.set(
  "fields",
  "id,caption,media_type,permalink,timestamp"
);
endpoint.searchParams.set("limit", "10");
endpoint.searchParams.set("access_token", token);

const response = await fetch(endpoint, {
  headers: { Accept: "application/json" },
});
const responseBody = await response.text();
let payload;

try {
  payload = JSON.parse(responseBody);
} catch {
  throw new Error(`Instagram API vrátilo neplatnou odpověď (HTTP ${response.status}).`);
}

if (!response.ok) {
  const message = payload?.error?.message || `HTTP ${response.status}`;
  throw new Error(`Instagram API: ${message}`);
}

const items = (Array.isArray(payload.data) ? payload.data : [])
  .filter((item) => typeof item.permalink === "string" && item.permalink.includes("instagram.com/"))
  .slice(0, 5)
  .map((item) => ({
    id: String(item.id),
    permalink: item.permalink,
    media_type: item.media_type || "IMAGE",
    timestamp: item.timestamp || null,
    caption: typeof item.caption === "string"
      ? item.caption.replace(/\s+/g, " ").trim().slice(0, 240)
      : "",
  }));

if (!items.length) {
  throw new Error("Instagram API nevrátilo žádné publikované příspěvky.");
}

const feedPath = new URL("../instagram-feed.json", import.meta.url);
let previous = null;

try {
  previous = JSON.parse(await readFile(feedPath, "utf8"));
} catch {
  // První úspěšná aktualizace vytvoří nový obsah.
}

const unchanged = previous?.source === "instagram-api"
  && JSON.stringify(previous.items) === JSON.stringify(items);

if (unchanged) {
  console.log("Instagram je aktuální, není co měnit.");
  process.exit(0);
}

const feed = {
  profile: "futsalinvictus2011",
  source: "instagram-api",
  updated_at: new Date().toISOString(),
  items,
};

await writeFile(feedPath, `${JSON.stringify(feed, null, 2)}\n`, "utf8");
console.log(`Uloženo ${items.length} nejnovějších příspěvků.`);
