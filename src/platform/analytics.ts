/**
 * Centralized analytics service.
 * - Loads Google Analytics 4 once, performance-consciously.
 * - Exposes a single reusable API used by the shell and experiences.
 * - Bridges internal platform events to GA4.
 */

import { config } from './config';
import { events, type PlatformEventDetail } from './events';
import type { AnalyticsAPI } from './types';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let gaInitialized = false;

function isDeveloperOrAdminArea(path: string): boolean {
  const cleanPath = path.toLowerCase();
  return (
    cleanPath.includes('/admin') ||
    cleanPath.includes('/developer') ||
    cleanPath.includes('/dev') ||
    cleanPath.includes('/test') ||
    cleanPath.includes('/debug') ||
    cleanPath.includes('/diagnostics')
  );
}

export function initAnalytics(): void {
  if (config.disableAnalytics) return;
  if (gaInitialized) return;
  if (typeof document === 'undefined') return;

  // Normalize GA4 Measurement ID: support 'GA4541307705' and format as standard 'G-A4541307705'
  const rawId = config.gaId;
  let normalizedId = rawId;
  if (!rawId.startsWith('G-')) {
    if (rawId.startsWith('GA')) {
      normalizedId = 'G-' + rawId.substring(1);
    } else {
      normalizedId = 'G-' + rawId;
    }
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', normalizedId, {
    send_page_view: false,
    transport_type: 'beacon',
    cookie_flags: 'SameSite=None;Secure',
    // Privacy safeguarding: disable tracking features that gather personal info
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    restricted_data_processing: true,
    custom_map: {
      dimension1: 'experience_id',
      dimension2: 'category',
    },
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${normalizedId}`;
  document.head.appendChild(script);

  gaInitialized = true;

  // Bridge key internal events to GA4.
  events.on('experience_opened', forwardToGa);
  events.on('experience_started', forwardToGa);
  events.on('experience_completed', forwardToGa);
  events.on('experience_abandoned', forwardToGa);
  events.on('project_viewed', forwardToGa);
  events.on('search_used', forwardToGa);
  events.on('download_started', forwardToGa);
}

function forwardToGa(event: CustomEvent<PlatformEventDetail>): void {
  if (!gaInitialized || typeof window.gtag !== 'function') return;
  if (isDeveloperOrAdminArea(window.location.pathname)) return;
  window.gtag('event', event.type, event.detail);
}

function pageView(title: string, path: string = window.location.pathname): void {
  if (isDeveloperOrAdminArea(path)) return;
  if (!gaInitialized || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_title: title,
    page_location: `${window.location.origin}${path}`,
    page_path: path,
  });
}

function track(name: string, params: Record<string, unknown> = {}): void {
  // Always emit on the internal bus first so experiences stay decoupled from GA.
  events.emit(name, params);
  if (isDeveloperOrAdminArea(window.location.pathname)) return;
  if (!gaInitialized || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

export const analytics: AnalyticsAPI = {
  pageView,
  track,
};
