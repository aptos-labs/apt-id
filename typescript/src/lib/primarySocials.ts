import type { ProfileLink } from "../types/index.ts";

export const PRIMARY_SOCIAL_PREFIX = "__primary:";

export const SUPPORTED_PRIMARY_SOCIALS = {
  x: {
    name: "X (Twitter)",
    placeholder: "@username",
    baseUrl: "https://x.com/",
  },
  telegram: {
    name: "Telegram",
    placeholder: "@username",
    baseUrl: "https://t.me/",
  },
  github: {
    name: "GitHub",
    placeholder: "username",
    baseUrl: "https://github.com/",
  },
} as const;

export type PrimarySocialPlatform = keyof typeof SUPPORTED_PRIMARY_SOCIALS;

export type PrimarySocials = { [platform: string]: string };

export function isSupportedPrimarySocial(platform: string): platform is PrimarySocialPlatform {
  return platform in SUPPORTED_PRIMARY_SOCIALS;
}

export function isPrimarySocialKey(key: string): boolean {
  return key.startsWith(PRIMARY_SOCIAL_PREFIX);
}

export function splitProfileLinks(links: ProfileLink[]): {
  regularLinks: ProfileLink[];
  primarySocials: PrimarySocials;
} {
  const regularLinks: ProfileLink[] = [];
  const primarySocials: PrimarySocials = {};

  for (const link of links) {
    const key = link.id || link.title;
    if (isPrimarySocialKey(key)) {
      const platform = key.slice(PRIMARY_SOCIAL_PREFIX.length);
      if (platform) {
        primarySocials[platform] = link.url;
      }
    } else {
      regularLinks.push(link);
    }
  }

  return { regularLinks, primarySocials };
}

export function toPrimarySocialUrl(platform: string, handleOrUrl: string): string {
  const trimmed = handleOrUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const handle = trimmed.replace(/^@+/, "");
  if (isSupportedPrimarySocial(platform)) {
    return `${SUPPORTED_PRIMARY_SOCIALS[platform].baseUrl}${handle}`;
  }

  return trimmed;
}

export function extractPrimarySocialHandle(platform: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const prefixes: Array<string | undefined> = [
    isSupportedPrimarySocial(platform) ? SUPPORTED_PRIMARY_SOCIALS[platform].baseUrl : undefined,
  ];
  if (platform === "x") {
    prefixes.push("https://twitter.com/", "https://www.twitter.com/", "https://www.x.com/");
  }
  if (platform === "telegram") {
    prefixes.push("https://telegram.me/", "https://www.t.me/");
  }
  if (platform === "github") {
    prefixes.push("https://www.github.com/");
  }

  for (const prefix of prefixes) {
    if (prefix && trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length).replace(/^@+/, "").replace(/\/+$/, "");
    }
  }

  return trimmed.replace(/^@+/, "");
}

export function buildPrimarySocialUpdates(
  handles: PrimarySocials,
  previousUrls: PrimarySocials = {},
): { toUpsert: { names: string[]; urls: string[] }; toRemove: string[] } {
  const names: string[] = [];
  const urls: string[] = [];
  const toRemove: string[] = [];
  const platforms = new Set([
    ...Object.keys(SUPPORTED_PRIMARY_SOCIALS),
    ...Object.keys(handles),
    ...Object.keys(previousUrls),
  ]);

  for (const platform of platforms) {
    const handle = (handles[platform] ?? "").trim();
    const key = `${PRIMARY_SOCIAL_PREFIX}${platform}`;
    if (handle) {
      names.push(key);
      urls.push(toPrimarySocialUrl(platform, handle));
    } else if (previousUrls[platform]) {
      toRemove.push(key);
    }
  }

  return { toUpsert: { names, urls }, toRemove };
}
