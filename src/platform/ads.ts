/**
 * AdSense integration for ITTYBITTYBITES SPA
 * - Consent-aware: only loads/pushes ads after user consent
 * - SPA-aware: re-pushes ads on client-side navigation
 * - Policy-safe: never inside .game-container / canvas
 */

export const ADSENSE_CLIENT = 'ca-pub-1566091161594729';
export const ADSENSE_ENABLED = true;

// Slot IDs — create these in AdSense > Ads > By ad unit (or use Auto Ads only)
// Using placeholders now — replace YYYYYYYYYY with real slot IDs or leave for Auto Ads
export const AD_SLOTS = {
  homeTop: 'YYYYYYYY01',
  homeInFeed: 'YYYYYYYY02',
  experiencesTop: 'YYYYYYYY03',
  experiencesInFeed: 'YYYYYYYY04',
  experiencesMultiplex: 'YYYYYYYY05',
  experienceAbove: 'YYYYYYYY06',
  experienceBelow: 'YYYYYYYY07',
} as const;

const CONSENT_KEY = 'ittybittybites-ads-consent'; // 'accepted' | 'rejected' | null

export type ConsentChoice = 'accepted' | 'rejected' | null;

export function getConsent(): ConsentChoice {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === 'accepted' || v === 'rejected') return v;
    return null;
  } catch { return null; }
}

export function setConsent(choice: ConsentChoice): void {
  try {
    if (choice === null) localStorage.removeItem(CONSENT_KEY);
    else localStorage.setItem(CONSENT_KEY, choice);
  } catch {}
  // Notify banner and ads system
  window.dispatchEvent(new CustomEvent('ads-consent-changed', { detail: { choice } }));
  if (choice === 'accepted') {
    enableAds();
  }
}

let adsEnabled = false;

export function isAdsAllowed(): boolean {
  return ADSENSE_ENABLED && getConsent() === 'accepted';
}

export function enableAds(): void {
  if (adsEnabled) return;
  if (!isAdsAllowed()) return;
  adsEnabled = true;
  // trigger push for any slots already in DOM
  refreshAds();
}

export function refreshAds(): void {
  if (!isAdsAllowed()) return;
  try {
    // @ts-ignore — adsbygoogle is global after script loads
    const w = window as any;
    w.adsbygoogle = w.adsbygoogle || [];
    // Push all ins.adsbygoogle that haven't been filled yet
    // We push empty object — AdSense fills all unfilled ins tags
    const slots = document.querySelectorAll('ins.adsbygoogle');
    if (slots.length > 0) {
      // Only push once per refresh to avoid duplicate pushes
      w.adsbygoogle.push({});
    }
  } catch (e) {
    console.warn('[ads] refresh failed', e);
  }
}

// Called on initial load after consent check
export function initAds(): void {
  if (!ADSENSE_ENABLED) {
    console.info('[ads] disabled — set ADSENSE_ENABLED=true and set real client ID');
    return;
  }
  if (getConsent() === 'accepted') {
    enableAds();
  }
  // Listen for SPA navigation — router will call refreshAds, but also listen here
  window.addEventListener('ads-refresh', refreshAds);
}
