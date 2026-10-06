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

const PLATFORM_HOSTS: Record<PrimarySocialPlatform, readonly string[]> = {
  x: ["x.com", "twitter.com"],
  telegram: ["t.me", "telegram.me"],
  github: ["github.com"],
};

export function isSupportedPrimarySocial(platform: string): platform is PrimarySocialPlatform {
  return Object.prototype.hasOwnProperty.call(SUPPORTED_PRIMARY_SOCIALS, platform);
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
      const platform = key.slice(PRIMARY_SOCIAL_PREFIX.length).toLowerCase();
      if (platform) {
        primarySocials[platform] = link.url;
      }
    } else {
      regularLinks.push(link);
    }
  }

  return { regularLinks, primarySocials };
}

export function isSafePrimarySocialUrl(platform: string, url: string): boolean {
  if (!/^https:\/\//i.test(url) || !isSupportedPrimarySocial(platform)) {
    return false;
  }
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    return PLATFORM_HOSTS[platform].some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

export function toPrimarySocialUrl(platform: string, handleOrUrl: string): string | null {
  const trimmed = handleOrUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    const httpsUrl = trimmed.replace(/^http:\/\//i, "https://");
    return isSafePrimarySocialUrl(platform, httpsUrl) ? httpsUrl : null;
  }

  const handle = trimmed.replace(/^@+/, "");
  if (!handle || /[/?#]/.test(handle) || !isSupportedPrimarySocial(platform)) {
    return null;
  }

  return `${SUPPORTED_PRIMARY_SOCIALS[platform].baseUrl}${handle}`;
}

export function extractPrimarySocialHandle(platform: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
      if (
        isSupportedPrimarySocial(platform) &&
        PLATFORM_HOSTS[platform].some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
      ) {
        return parsed.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
      }
    } catch {
      return trimmed.replace(/^@+/, "");
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
    const url = handle ? toPrimarySocialUrl(platform, handle) : null;
    if (url) {
      names.push(key);
      urls.push(url);
    } else if (previousUrls[platform]) {
      toRemove.push(key);
    }
  }

  return { toUpsert: { names, urls }, toRemove };
}
