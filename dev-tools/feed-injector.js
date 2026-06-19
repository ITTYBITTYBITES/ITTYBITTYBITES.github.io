/**
 * Automated Intel Stream — Live RSS Parser & Affiliate Injector
 * Vanilla ES6. Client-side only. No data persistence, no tracking, no scoring.
 * Fetches a public RSS feed via rss2json, overrides links with the site's
 * Amazon Associate tag, and renders a responsive grid of cards.
 */

(function () {
  'use strict';

  const CONFIG = {
    // Public neuroscience/education RSS feed piped through rss2json
    feedApiUrl: 'https://api.rss2json.com/v1/api.json?rss_url=' +
      encodeURIComponent('https://www.npr.org/sections/book-reviews/feed'),
    containerId: 'automated-intel-stream',
    maxItems: 12,
    fallbackTag: 'ittybittybite-20',
  };

  /**
   * Extract the active Amazon Associate tag from existing page links.
   * Scans all anchors pointing to amazon.com in the DOM.
   */
  const extractAffiliateTag = () => {
    const links = document.querySelectorAll('a[href*="amazon.com"]');
    for (const link of links) {
      const match = link.href.match(/[?&]tag=([a-zA-Z0-9\-]+)/);
      if (match && match[1]) return match[1];
    }
    return CONFIG.fallbackTag;
  };

  /**
   * Wipe common affiliate/tracking query parameters and append our tag.
   */
  const cleanAndTag = (url, tag) => {
    try {
      const u = new URL(url);
      const paramsToStrip = [
        'tag', 'ref', 'linkId', 'smid', 'ascsubtag', 'camp', 'creative',
        'keywords', 'tag', 'ie', 'linkCode', 'hvadid', 'hvpos', 'hvnetw',
        'hvrand', 'hvpone', 'hvptwo', 'hvqmt', 'hvdev', 'hvdict'
      ];
      paramsToStrip.forEach(p => u.searchParams.delete(p));
      u.searchParams.set('tag', tag);
      return u.toString();
    } catch (err) {
      console.warn('[FEED INJECTOR] URL parse failed:', url);
      return url;
    }
  };

  /**
   * Resolve a destination URL for a feed item.
   * Prefer Amazon links in the item.link or description; otherwise fall back to
   * an Amazon search link for the item title.
   */
  const resolveLink = (item, tag) => {
    // Primary item link
    if (item.link && item.link.includes('amazon.com')) {
      return cleanAndTag(item.link, tag);
    }

    // Embedded links in description
    if (item.description) {
      const hrefMatches = item.description.match(/href=["']([^"']+)["']/gi) || [];
      for (const raw of hrefMatches) {
        const url = raw.replace(/href=["']/i, '').replace(/["']$/, '');
        if (url.includes('amazon.com')) {
          return cleanAndTag(url, tag);
        }
      }
    }

    // Fallback: Amazon search for the title
    const query = encodeURIComponent(item.title);
    return `https://www.amazon.com/s?k=${query}&tag=${tag}`;
  };

  /**
   * Render feed items into the target container.
   */
  const renderStream = (items, tag) => {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) {
      console.error('[FEED INJECTOR] Container not found:', CONFIG.containerId);
      return;
    }

    container.innerHTML = '';

    items.slice(0, CONFIG.maxItems).forEach(item => {
      const link = resolveLink(item, tag);
      const date = item.pubDate
        ? new Date(item.pubDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          })
        : '';
      const snippet = item.description
        ? item.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140) + '…'
        : '';

      const card = document.createElement('article');
      card.className = 'bg-slate-900/50 border border-slate-800 rounded-lg p-5 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all flex flex-col';
      card.innerHTML = `
        <span class="text-[9px] tracking-[2px] text-cyan-400 uppercase border border-cyan-400/30 px-2 py-0.5 inline-block mb-3">INTEL STREAM</span>
        <h3 class="font-display text-sm text-slate-50 mb-2 leading-snug flex-grow">${item.title}</h3>
        <time class="text-slate-500 text-[10px] uppercase tracking-[1px] mb-3">${date}</time>
        <p class="text-slate-400 text-xs leading-relaxed mb-4">${snippet}</p>
        <a href="${link}" target="_blank" rel="noopener noreferrer"
           class="block w-full text-center px-4 py-3 border border-gold-400 text-gold-400 text-[10px] tracking-[1px] uppercase hover:bg-gold-400 hover:text-slate-950 transition-colors mt-auto"
           aria-label="Acquire ${item.title} via Amazon portal">
          ACQUIRE COMPONENT VIA PORTAL >>
        </a>
      `;
      container.appendChild(card);
    });
  };

  /**
   * Fetch the feed and render it.
   */
  const init = async () => {
    const tag = extractAffiliateTag();
    console.log('[FEED INJECTOR] Affiliate tag resolved:', tag);

    const container = document.getElementById(CONFIG.containerId);
    if (!container) return;

    try {
      const response = await fetch(CONFIG.feedApiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data.items || data.items.length === 0) throw new Error('Empty feed');
      renderStream(data.items, tag);
    } catch (err) {
      console.error('[FEED INJECTOR] Failed to load stream:', err);
      container.innerHTML = `
        <p class="text-slate-400 text-sm text-center col-span-full py-8">
          Live intel stream is temporarily unavailable. <a href="library.html" class="text-cyan-400 hover:text-emerald-400 transition-colors">Browse the static locker</a> for available resources.
        </p>`;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
