// app/lib/utm.ts

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

const UTM_KEYS: (keyof UtmParams)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

const STORAGE_KEY = "utm_params";
const TIMESTAMP_KEY = "utm_timestamp";

/**
 * Capture UTMs from the current URL.
 * - Stores ONLY if at least one UTM param exists
 * - First-click attribution (does NOT overwrite existing UTMs)
 */
export function captureUtmParams() {
  if (typeof window === "undefined") return;

  // Do not overwrite existing UTMs
  if (localStorage.getItem(STORAGE_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const utms: UtmParams = {};

  let hasUtm = false;

  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utms[key] = value;
      hasUtm = true;
    }
  });

  if (!hasUtm) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(utms));
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
}

/**
 * Read stored UTMs (for attaching to lead / booking)
 */
export function getStoredUtms(): UtmParams | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UtmParams;
  } catch {
    return null;
  }
}

/**
 * Optional: clear UTMs (rarely needed)
 */
export function clearUtms() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
}
