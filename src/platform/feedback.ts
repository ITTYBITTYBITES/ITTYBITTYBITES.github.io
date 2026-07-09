/**
 * Interaction Feedback — Library Season 1
 *
 * Connects: sound + haptics + visual state + accessible announcements
 * Principle: every signal answers "what just happened?"
 */

import { audio, type InteractionTone, type CollectionId } from './audio';
import { events } from './events';

let announcer: HTMLElement | null = null;
let initialized = false;

function ensureAnnouncer() {
  if (announcer || typeof document === 'undefined') return;
  announcer = document.getElementById('ibb-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'ibb-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }
}

function announce(msg: string) {
  ensureAnnouncer();
  if (!announcer) return;
  announcer.textContent = '';
  // delay to ensure SR re-reads identical successive messages
  setTimeout(() => { if (announcer) announcer.textContent = msg; }, 30);
}

function haptic(pattern: number | number[]) {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch { /* ignore */ }
  }
}

const TONE_ANNOUNCE: Record<InteractionTone, string> = {
  select: 'Selected.',
  confirm: 'Confirmed.',
  success: 'Step complete.',
  complete: 'Experience complete. Well considered.',
  discover: 'Pattern found.',
  transition: 'Moving to next view.',
  back: 'Returned.',
  progress: 'Progress updated.',
  return: 'Welcome back.'
};

export interface SignalOptions {
  element?: HTMLElement | null;
  announceText?: string;
  hapticPattern?: number | number[];
  silent?: boolean; // visual/haptic only
}

export function signal(tone: InteractionTone, opts: SignalOptions = {}) {
  const { element, announceText, hapticPattern, silent } = opts;

  if (!silent) {
    void audio.play(tone);
  }

  // haptic — calm, short
  if (hapticPattern !== null) {
    const map: Record<InteractionTone, number | number[]> = {
      select: 8,
      confirm: [10, 30, 12],
      success: [12, 25, 18],
      complete: [14, 40, 18, 40, 22],
      discover: [10, 20, 14, 20, 16],
      transition: 10,
      back: 9,
      progress: 7,
      return: [8, 35, 12]
    };
    haptic(hapticPattern ?? map[tone] ?? 8);
  }

  // accessible announcement
  announce(announceText ?? TONE_ANNOUNCE[tone]);

  // visual pulse
  if (element) {
    element.classList.remove('feedback-pulse');
    // force reflow
    void element.offsetWidth;
    element.classList.add('feedback-pulse');
    element.addEventListener('animationend', () => {
      element.classList.remove('feedback-pulse');
    }, { once: true });
  }
}

// ——— Global wiring ———

export function initFeedback() {
  if (initialized) return;
  initialized = true;
  ensureAnnouncer();

  // Track current collection for tonal identity
  events.on('experience_opened', (e: CustomEvent) => {
    const d = e.detail as { experience_id?: string; category?: string };
    // collection is looked up via registry in host; pass through event detail when available
    const col = (d as any).collection_id as CollectionId | undefined;
    if (col) {
      audio.setCollection(col);
      // returning signal is handled on route changes; keep this quiet
    }
  });

  // Experience interaction → meaningful sound
  events.on('experience_interaction', (e: CustomEvent) => {
    const detail = e.detail || {};
    const action: string = (detail.action || '').toString().toLowerCase();

    if (!action) {
      signal('select', { silent: true }); // visual only fallback
      return;
    }

    if (/(complete|finished|all_solved|collection_complete)/.test(action)) {
      signal('complete');
      return;
    }
    if (/(solved|success|correct|proved|discovered|pattern_found|insight)/.test(action)) {
      signal('discover');
      return;
    }
    if (/(progress|step|next|advanced|unlocked)/.test(action)) {
      signal('progress');
      return;
    }
    if (/(confirm|submit|validate|test|check)/.test(action)) {
      signal('confirm');
      return;
    }
    // default: calm select
    signal('select', { silent: true });
  });

  // Collection completed
  events.on('collection_completed', () => {
    signal('complete', { announceText: 'Collection complete. A thoughtful set of experiences finished.' });
  });

  // Global UI clicks — gentle select feedback
  document.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    const interactive = target.closest('button, a[href], [role="button"], .card a, .suggestion-card, .mini-card, .browse-card');
    if (interactive && interactive instanceof HTMLElement) {
      // avoid double-firing when experience_interaction already handled it
      const isExperienceControl = !!interactive.closest('experience-host');
      if (!isExperienceControl) {
        signal('select', { element: interactive, silent: false });
      } else {
        // still give visual pulse, but quieter sound (already handled by experience event if present)
        signal('select', { element: interactive, silent: true });
      }
    }
  }, true);

  // Keyboard activation
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      const active = document.activeElement as HTMLElement | null;
      if (active && active.matches('button, a[href], [role="button"]')) {
        signal('select', { element: active, silent: true });
      }
    }
  }, true);

  // Route transitions
  let lastPath = location.pathname;
  const origPush = history.pushState;
  history.pushState = function(...args) {
    const res = origPush.apply(this, args as any);
    queueMicrotask(checkRoute);
    return res;
  };
  window.addEventListener('popstate', checkRoute);

  function checkRoute() {
    const path = location.pathname;
    if (path === lastPath) return;
    lastPath = path;

    // collection return feeling
    if (path.startsWith('/collections') || path.startsWith('/library') || path === '/') {
      signal('return', { silent: false });
    } else if (path.startsWith('/experience/')) {
      signal('transition', { silent: false });
    } else {
      signal('transition', { silent: true });
    }
  }
}

// Convenience exports
export const feedback = {
  select: (el?: HTMLElement | null, text?: string) => signal('select', { element: el ?? undefined, announceText: text }),
  confirm: (el?: HTMLElement | null, text?: string) => signal('confirm', { element: el ?? undefined, announceText: text }),
  success: (el?: HTMLElement | null, text?: string) => signal('success', { element: el ?? undefined, announceText: text }),
  discover: (el?: HTMLElement | null, text?: string) => signal('discover', { element: el ?? undefined, announceText: text }),
  complete: (el?: HTMLElement | null, text?: string) => signal('complete', { element: el ?? undefined, announceText: text }),
  progress: (el?: HTMLElement | null, text?: string) => signal('progress', { element: el ?? undefined, announceText: text }),
};
