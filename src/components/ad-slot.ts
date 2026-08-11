import { ADSENSE_CLIENT, AD_SLOTS, getConsent } from '../platform/ads';
import { h } from '../platform/utils';

/**
 * Creates a compliant ad container.
 * - Always reserves space (min-height) to avoid CLS
 * - Labels as Advertisement
 * - Only renders ins tag if consent = accepted; otherwise shows placeholder + disabled message
 */

export type AdVariant = 'banner' | 'in-feed' | 'in-article' | 'multiplex';

interface AdOptions {
  slot: string; // value from AD_SLOTS
  variant?: AdVariant;
  label?: string;
  className?: string;
}

export function createAdSlot(opts: AdOptions): HTMLElement {
  const variant = opts.variant || 'banner';
  const wrapper = h('div', {
    class: `ad-container ad-${variant} ${opts.className || ''}`.trim(),
    'data-ad-slot': opts.slot,
    'aria-label': 'Advertisement',
    role: 'complementary',
  }, []);

  const label = h('div', { class: 'ad-label' }, [opts.label || 'Advertisement']);
  wrapper.appendChild(label);

  // Check consent
  const consent = getConsent();
  const isEnabled = consent === 'accepted';

  if (!isEnabled) {
    // Show privacy-friendly placeholder (doesn't load AdSense)
    const placeholder = h('div', { class: 'ad-placeholder' }, [
      h('p', { class: 'ad-placeholder-text' }, [
        'Ad will appear here after you accept cookies. ',
        h('a', { href: '/privacy', style: 'color:#2e3f57;text-decoration:underline;' }, ['Manage preferences'])
      ])
    ]);
    wrapper.appendChild(placeholder);
    // Listen for consent change to auto-replace
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.choice === 'accepted' && wrapper.isConnected) {
        window.removeEventListener('ads-consent-changed', onConsent as EventListener);
        const replacement = createAdIns(opts);
        wrapper.innerHTML = '';
        wrapper.appendChild(label);
        wrapper.appendChild(replacement);
        requestAnimationFrame(() => {
          try { (window as any).adsbygoogle = (window as any).adsbygoogle || []; (window as any).adsbygoogle.push({}); } catch {}
        });
      }
    };
    window.addEventListener('ads-consent-changed', onConsent as EventListener);
    return wrapper;
  }

  wrapper.appendChild(createAdIns(opts));
  // Push after insertion
  requestAnimationFrame(() => {
    try { (window as any).adsbygoogle = (window as any).adsbygoogle || []; (window as any).adsbygoogle.push({}); } catch {}
  });

  return wrapper;
}

function createAdIns(opts: AdOptions): HTMLElement {
  const ins = h('ins', {
    class: 'adsbygoogle',
    style: 'display:block',
    'data-ad-client': ADSENSE_CLIENT,
    'data-ad-slot': opts.slot,
  }, []) as HTMLElement;

  // Variants mapping to AdSense attributes
  if (opts.variant === 'in-feed' || opts.variant === 'in-article') {
    ins.setAttribute('data-ad-format', 'fluid');
    ins.setAttribute('data-ad-layout-key', '-fb+5w+4e-db+86');
  } else if (opts.variant === 'multiplex') {
    ins.setAttribute('data-ad-format', 'autorelaxed');
  } else {
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
  }

  return ins;
}

// Helper shortcuts for the 5 recommended placements
export function adHomeTop() {
  return createAdSlot({ slot: AD_SLOTS.homeTop, variant: 'banner', className: 'ad-home-top' });
}
export function adHomeInFeed() {
  return createAdSlot({ slot: AD_SLOTS.homeInFeed, variant: 'in-feed', className: 'ad-home-infeed' });
}
export function adExperiencesTop() {
  return createAdSlot({ slot: AD_SLOTS.experiencesTop, variant: 'banner', className: 'ad-experiences-top' });
}
export function adExperiencesInFeed() {
  return createAdSlot({ slot: AD_SLOTS.experiencesInFeed, variant: 'in-feed', className: 'ad-experiences-infeed' });
}
export function adExperiencesMultiplex() {
  return createAdSlot({ slot: AD_SLOTS.experiencesMultiplex, variant: 'multiplex', className: 'ad-multiplex' });
}
export function adExperienceAbove() {
  return createAdSlot({ slot: AD_SLOTS.experienceAbove, variant: 'banner', className: 'ad-experience-above' });
}
export function adExperienceBelow() {
  return createAdSlot({ slot: AD_SLOTS.experienceBelow, variant: 'in-article', className: 'ad-experience-below' });
}
