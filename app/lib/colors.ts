export const COLORS = {
  // ── Core Palette ──────────────────────────────────────────
  heroOverlay: '#19324D',   // Deep navy
  primary: '#0F766E',       // Premium teal
  primaryHover: '#115E59',  // Darker teal hover

  heading: '#19324D',       // Rich navy headings
  body: '#475569',          // Slate text

  background: '#F8FAFC',    // Soft off-white
  card: '#FFFFFF',
  border: '#E7EDF3',        // Softer borders

  success: '#16A34A',

  // Optional supporting colors
  primaryLight: '#E6F5F3',  // Pills, badges, subtle backgrounds
  primaryDark: '#0A4F4B',   // Active states
  accentText: '#0E8A84',    // Links/highlight text
  muted: '#64748B',

  // Legacy aliases
  accent: '#0F766E',
} as const;


// ── Tailwind arbitrary-value helpers ────────────────────────
export const TW = {
  heroOverlay: COLORS.heroOverlay,
  primary: COLORS.primary,
  primaryHover: COLORS.primaryHover,
  heading: COLORS.heading,
  body: COLORS.body,
  background: COLORS.background,
  card: COLORS.card,
  border: COLORS.border,
  success: COLORS.success,

  primaryLight: COLORS.primaryLight,
  primaryDark: COLORS.primaryDark,
  accentText: COLORS.accentText,
  muted: COLORS.muted,
} as const;