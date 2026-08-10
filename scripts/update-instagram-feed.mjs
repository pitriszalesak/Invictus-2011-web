import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const FEED_PATH = new URL("../instagram-feed.json", import.meta.url);
const TOKEN_STATE_PATH = new URL("../.instagram-token.enc", import.meta.url);
const PROFILE = "futsalinvictus2011";
const API_URL = new URL("https://graph.instagram.com/me/media");
const TOKEN_REFRESH_URL = new URL("https://graph.instagram.com/refresh_access_token");
const TOKEN_REFRESH_AFTER_MS = 25 * 24 * 60 * 60 * 1000;

API_URL.searchParams.set("fields", "id,media_type,permalink,timestamp,username");
API_URL.searchParams.set("limit", "10");

function normalizeMediaType(value) {
  if (value === "VIDEO" || value === "REELS") return "VIDEO";
  if (value === "CAROUSEL_ALBUM") return "CAROUSEL_ALBUM";
  return "IMAGE";
}

function normalizeItem(item) {
  if (!item || typeof item.permalink !== "string") return null;

  let permalink;
  try {
    const url = new URL(item.permalink);
    const validHost = url.hostname === "www.instagram.com" || url.hostname === "instagram.com";
    const validPath = /^\/(?:p|reel|tv)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);
    if (!validHost || !validPath) return null;
    url.hostname = "www.instagram.com";
    url.search = "";
    url.hash = "";
    permalink = url.toString();
  } catch {
    return null;
  }

  return {
    permalink,
    media_type: normalizeMediaType(item.media_type),
    timestamp: typeof item.timestamp === "string" ? item.timestamp : null,
  };
}

export function buildFeed(apiPayload, updatedAt = new Date()) {
  const apiItems = Array.isArray(apiPayload?.data) ? apiPayload.data : [];
  const items = apiItems.map(normalizeItem).filter(Boolean).slice(0, 5);

  if (!items.length) {
    throw new Error("Instagram API nevrátilo žádné platné příspěvky.");
  }

  const usernames = apiItems
    .map((item) => item?.username)
    .filter((username) => typeof username === "string" && username.length > 0);
  if (usernames.length && usernames.some((username) => username.toLowerCase() !== PROFILE)) {
    throw new Error(`Token patří jinému Instagram profilu než @${PROFILE}.`);
  }

  return {
    profile: PROFILE,
    source: "instagram-api",
    updated_at: updatedAt.toISOString(),
    items,
  };
}

function haveSameItems(currentFeed, nextFeed) {
  return JSON.stringify(currentFeed?.items ?? []) === JSON.stringify(nextFeed.items);
}

function deriveEncryptionKey(keyMaterial, salt) {
  return scryptSync(keyMaterial, salt, 32);
}

export function encryptTokenState(state, keyMaterial) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = deriveEncryptionKey(keyMaterial, salt);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(state), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return `${JSON.stringify({
    version: 1,
    algorithm: "aes-256-gcm+scrypt",
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    auth_tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  }, null, 2)}\n`;
}

export function decryptTokenState(payload, keyMaterial) {
  const envelope = JSON.parse(payload);
  if (envelope?.version !== 1 || envelope?.algorithm !== "aes-256-gcm+scrypt") {
    throw new Error("Neznámý formát zašifrovaného Instagram tokenu.");
  }

  const salt = Buffer.from(envelope.salt, "base64");
  const iv = Buffer.from(envelope.iv, "base64");
  const authTag = Buffer.from(envelope.auth_tag, "base64");
  const ciphertext = Buffer.from(envelope.ciphertext, "base64");
  const key = deriveEncryptionKey(keyMaterial, salt);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const state = JSON.parse(plaintext.toString("utf8"));

  if (typeof state?.access_token !== "string" || !state.access_token) {
    throw new Error("Zašifrovaný stav neobsahuje platný Instagram token.");
  }
  return state;
}

async function loadTokenState(bootstrapToken) {
  try {
    return decryptTokenState(await readFile(TOKEN_STATE_PATH, "utf8"), bootstrapToken);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { access_token: bootstrapToken, refreshed_at: null };
    }
    throw error;
  }
}

function tokenNeedsRefresh(refreshedAt) {
  const refreshedTime = new Date(refreshedAt).getTime();
  return Number.isNaN(refreshedTime) || Date.now() - refreshedTime >= TOKEN_REFRESH_AFTER_MS;
}

async function refreshAccessToken(accessToken) {
  const url = new URL(TOKEN_REFRESH_URL);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`Obnovení Instagram tokenu selhalo (stav ${response.status}).`);
  }

  const data = await response.json();
  if (typeof data?.access_token !== "string" || !data.access_token) {
    throw new Error("Instagram nevrátil nový dlouhodobý token.");
  }
  return data.access_token;
}

async function fetchInstagramFeed(accessToken) {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `Instagram API odpovědělo stavem ${response.status}.`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed?.error?.message) message += ` ${parsed.error.message}`;
    } catch {
      // The status is enough when Instagram returns a non-JSON error page.
    }
    throw new Error(message);
  }

  return response.json();
}

async function main() {
  const bootstrapToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!bootstrapToken) {
    throw new Error("Chybí GitHub secret INSTAGRAM_ACCESS_TOKEN.");
  }

  const tokenState = await loadTokenState(bootstrapToken);
  if (tokenNeedsRefresh(tokenState.refreshed_at)) {
    try {
      tokenState.access_token = await refreshAccessToken(tokenState.access_token);
      tokenState.refreshed_at = new Date().toISOString();
      await writeFile(TOKEN_STATE_PATH, encryptTokenState(tokenState, bootstrapToken), "utf8");
      console.log("Dlouhodobý Instagram token byl bezpečně obnoven.");
    } catch (error) {
      console.warn(`${error.message} Feed se zkusí načíst se stávajícím tokenem.`);
    }
  }

  const apiPayload = await fetchInstagramFeed(tokenState.access_token);
  const nextFeed = buildFeed(apiPayload);
  const currentFeed = JSON.parse(await readFile(FEED_PATH, "utf8"));

  if (haveSameItems(currentFeed, nextFeed)) {
    console.log("Instagram feed je aktuální; soubor se nemění.");
    return;
  }

  await writeFile(FEED_PATH, `${JSON.stringify(nextFeed, null, 2)}\n`, "utf8");
  console.log(`Instagram feed aktualizován: ${nextFeed.items.length} příspěvků.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
