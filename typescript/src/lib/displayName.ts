export const DISPLAY_NAME_MAX_LENGTH = 64;

export function stripAptSuffix(ansName: string | null | undefined): string {
  if (!ansName) {
    return "";
  }
  return ansName.replace(/\.apt$/i, "").trim();
}

export function formatAnsHandle(ansName: string | null | undefined): string {
  const handle = stripAptSuffix(ansName);
  return handle ? `${handle}.apt` : "";
}

export function getDisplayName(profile: {
  name?: string | null;
  title?: string | null;
  ansName?: string | null;
}): string {
  const custom = profile.name?.trim() || profile.title?.trim() || "";
  if (custom) {
    return custom;
  }
  return stripAptSuffix(profile.ansName) || "N/A";
}

export function shouldShowAnsHandle(displayName: string, ansName: string | null | undefined): boolean {
  const handle = stripAptSuffix(ansName);
  if (!handle) {
    return false;
  }
  const normalizedDisplay = displayName.trim().replace(/\.apt$/i, "");
  return normalizedDisplay !== handle;
}

export function resolveNameToSave(displayName: string, ansName: string): string {
  const trimmed = displayName.trim().slice(0, DISPLAY_NAME_MAX_LENGTH);
  if (trimmed) {
    return trimmed;
  }
  return stripAptSuffix(ansName) || ansName;
}
