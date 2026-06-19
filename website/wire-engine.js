/**
 * Wire Engine — Dual-Stream Client-Side Media Portal
 * Pipeline A: Live Cognitive Wire (breaking science RSS)
 * Pipeline B: Briefing Theater (video RSS with hover-glow containers)
 * Vanilla ES6. No storage, no tracking, no cookies. Client-side only.
 */

(function () {
  'use strict';

  const CONFIG = {
    // ScienceDaily Behavior / Mind & Brain RSS via rss2json proxy
    scienceFeed: 'https://api.rss2json.com/v1/api.json?rss_url=' +
      encodeURIComponent('https://www.sciencedaily.com/rss/mind_brain/behavior.xml'),
    // TED-Ed public channel feed via rss2json proxy
    videoFeed: 'https://api.rss2json.com/v1/api.json?rss_url=' +
      encodeURIComponent('https://www.youtube.com/feeds/videos.xml?channel_id=UCsooa4yRKGN_zEE8iknghZA'),
    maxScienceItems: 5,
    maxVideoItems: 3,
    fallbackTag: 'ittybittybite-20',
  };

  /**
   * Discover the active Amazon Associate tag from existing page links.
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
   * Strip common affiliate/tracking parameters and append our tag.
   */
  const cleanAndTag = (url, tag) => {
    try {
      const u = new URL(url);
      const strip = [
        'tag', 'ref', 'linkId', 'smid', 'ascsubtag', 'camp', 'creative',
        'keywords', 'subid', 'ie', 'linkCode', 'hvadid', 'hvpos', 'hvnetw',
        'hvrand', 'hvpone', 'hvptwo', 'hvqmt', 'hvdev', 'hvdict'
      ];
      strip.forEach(p => u.searchParams.delete(p));
      u.searchParams.set('tag', tag);
      return u.toString();
    } catch (err) {
      console.warn('[WIRE ENGINE] URL parse failed:', url);
      return url;
    }
  };

  /**
   * Render breaking science briefing logs with emerald left accent bands.
   */
  const renderScienceWire = (items, tag) => {
    const container = document.getElementById('live-science-wire');
    if (!container) return;
    container.innerHTML = '';

    items.slice(0, CONFIG.maxScienceItems).forEach(item => {
      const link = item.link ? cleanAndTag(item.link, tag) : '#';
      const date = item.pubDate
        ? new Date(item.pubDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          })
        : '';
      const snippet = item.description
        ? item.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) + '…'
        : '';

      const card = document.createElement('article');
      card.className = 'bg-slate-900/50 border border-slate-800 rounded-lg p-5 border-l-2 border-emerald-500 hover:border-cyan-400 transition-all';
      card.innerHTML = `
        <span class="text-[9px] tracking-[2px] text-emerald-400 uppercase mb-2 block">LIVE SCIENCE WIRE</span>
        <h3 class="font-display text-sm text-slate-50 mb-2 leading-snug">${item.title}</h3>
        <time class="text-slate-500 text-[10px] uppercase tracking-[1px] mb-2 block">${date}</time>
        <p class="text-slate-400 text-xs leading-relaxed mb-3">${snippet}</p>
        <a href="${link}" target="_blank" rel="noopener noreferrer"
           class="text-cyan-400 text-xs uppercase tracking-[1px] hover:text-emerald-400 transition-colors inline-flex items-center gap-1">
          Read briefing <span class="text-emerald-400">&gt;&gt;</span>
        </a>
      `;
      container.appendChild(card);
    });
  };

  /**
   * Render video briefing theater cards with hover-glow thresholds.
   */
  const renderVideoTheater = (items, tag) => {
    const container = document.getElementById('video-briefing-theater');
    if (!container) return;
    container.innerHTML = '';

    items.slice(0, CONFIG.maxVideoItems).forEach(item => {
      const videoIdMatch = item.link ? item.link.match(/[?&]v=([a-zA-Z0-9_-]+)/) : null;
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      const thumbnail = videoId
        ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        : '';
      const link = item.link ? cleanAndTag(item.link, tag) : '#';

      const card = document.createElement('article');
      card.className = 'bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_24px_rgba(34,211,238,0.15)] transition-all flex flex-col';
      card.innerHTML = `
        <div class="aspect-video bg-slate-800 relative overflow-hidden">
          ${thumbnail
            ? `<img src="${thumbnail}" alt="${item.title}" class="w-full h-full object-cover" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML += '<div class=\\'absolute inset-0 flex items-center justify-center text-slate-500 text-xs\\'>NO SIGNAL</div>';">`
            : '<div class="w-full h-full flex items-center justify-center text-slate-500 text-xs">NO SIGNAL</div>'}
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
        </div>
        <div class="p-4 flex flex-col flex-grow">
          <span class="text-[9px] tracking-[2px] text-cyan-400 uppercase mb-1 block">BRIEFING THEATER</span>
          <h3 class="font-display text-xs text-slate-50 mb-3 leading-snug flex-grow">${item.title}</h3>
          <a href="${link}" target="_blank" rel="noopener noreferrer"
             class="block w-full text-center px-3 py-2 border border-gold-400 text-gold-400 text-[9px] tracking-[1px] uppercase hover:bg-gold-400 hover:text-slate-950 transition-colors">
            DEPLOY BRIEFING >>
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  };

  /**
   * Generic fetch helper with offline fallback handling.
   */
  const fetchFeed = async (url) => {
    if (!navigator.onLine) {
      throw new Error('Browser is offline');
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.items || data.items.length === 0) throw new Error('Empty feed');
    return data.items;
  };

  /**
   * Orchestrate both pipelines.
   */
  const init = async () => {
    const tag = extractAffiliateTag();
    console.log('[WIRE ENGINE] Affiliate tag resolved:', tag);

    const wireContainer = document.getElementById('live-science-wire');
    const theaterContainer = document.getElementById('video-briefing-theater');

    try {
      const scienceItems = await fetchFeed(CONFIG.scienceFeed);
      renderScienceWire(scienceItems, tag);
    } catch (err) {
      console.error('[WIRE ENGINE] Science pipeline failed:', err);
      if (wireContainer) {
        wireContainer.innerHTML = `
          <div class="bg-slate-900/50 border border-slate-800 rounded-lg p-5 border-l-2 border-rose-500">
            <span class="text-[9px] tracking-[2px] text-rose-400 uppercase mb-2 block">WIRE OFFLINE</span>
            <p class="text-slate-400 text-sm">Live science wire is unavailable. <a href="library.html" class="text-cyan-400 hover:text-emerald-400 transition-colors">Browse the static catalog</a> for vetted resources.</p>
          </div>`;
      }
    }

    try {
      const videoItems = await fetchFeed(CONFIG.videoFeed);
      renderVideoTheater(videoItems, tag);
    } catch (err) {
      console.error('[WIRE ENGINE] Theater pipeline failed:', err);
      if (theaterContainer) {
        theaterContainer.innerHTML = `
          <div class="col-span-full bg-slate-900/50 border border-slate-800 rounded-lg p-5 border-l-2 border-rose-500">
            <span class="text-[9px] tracking-[2px] text-rose-400 uppercase mb-2 block">THEATER OFFLINE</span>
            <p class="text-slate-400 text-sm">Video briefing theater is unavailable. Check your connection and reload.</p>
          </div>`;
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
