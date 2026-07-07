/**
 * Central configuration for the platform.
 * Reads build-time environment variables and runtime signals.
 */

export interface PlatformConfig {
  /** Google Analytics 4 Measurement ID. */
  gaId: string;
  /** Base URL path (e.g. "/" for user/org GitHub Pages sites). */
  baseUrl: string;
  /** Production build flag. */
  isProduction: boolean;
  /** Default document title prefix. */
  siteTitle: string;
  /** Whether analytics should be disabled by environment or user preference. */
  disableAnalytics: boolean;
}

function shouldDisableAnalytics(): boolean {
  if (typeof window === 'undefined') return true;
  if (import.meta.env.VITE_DISABLE_ANALYTICS === 'true') return true;
  if (window.navigator.doNotTrack === '1') return true;
  if (window.navigator.doNotTrack === 'yes') return true;
  return false;
}

export const config: PlatformConfig = {
  gaId: 'G-A4541307705',
  baseUrl: import.meta.env.BASE_URL ?? '/',
  isProduction: import.meta.env.PROD ?? false,
  siteTitle: 'Platform',
  disableAnalytics: shouldDisableAnalytics() || !import.meta.env.PROD,
};
