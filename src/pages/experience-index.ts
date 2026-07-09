import { events } from '../platform/events';
import { getAllExperiences } from '../platform/registry';
import type { ExperienceEntry } from '../platform/registry-types';
import { getReturnSummary } from '../platform/lifecycle';
import { searchExperiences } from '../platform/search';
import { debounce, h } from '../platform/utils';
import { getCollectionCSSVariables, getCollectionIdentity, renderCollectionBadge } from '../platform/collection-identity';
import { renderExperienceHero } from '../platform/illustration-system';

import type { RouteParams } from '../platform/router';

export function renderIndex(args?: RouteParams): HTMLElement {
  const all = getAllExperiences();

  const grid = h('div', { class: 'grid publication-grid' }, []);
  const search = h('input', {
    class: 'search-input',
    type: 'search',
    placeholder: 'Search experiences by title, description, keywords…',
    'aria-label': 'Search experiences',
  });

  const filterTabs = h('div', { class: 'filter-tabs' }, []);
  const categories = [...new Set(all.map((entry) => entry.category))].sort();
  
  let activeFilter: any = null;
  if (args?.query) {
    const qCategory = args.query.get('category');
    if (qCategory && categories.includes(qCategory as any)) {
      activeFilter = qCategory;
    }
  }

  const updateGrid = (entries: ExperienceEntry[]): void => {
    renderGrid(grid, entries);
  };

  const updateSearch = (term: string): void => {
    if (!term.trim()) {
      updateGrid(activeFilter ? all.filter((entry) => entry.category === activeFilter) : all);
      return;
    }

    const results = searchExperiences(term);
    const matchedIds = new Set(results.map((result) => result.id));
    const filtered = all.filter((entry) => matchedIds.has(entry.id));
    updateGrid(filtered);
    events.emit('search_used', { term: term.trim(), result_count: filtered.length });
  };

  const debouncedSearch = debounce(updateSearch, 150);
  search.addEventListener('input', () => debouncedSearch(search.value));

  const allTab = h('button', {
    class: `filter-tab${activeFilter === null ? ' active' : ''}`,
    type: 'button',
    'aria-pressed': activeFilter === null ? 'true' : 'false',
  }, ['All']);

  allTab.addEventListener('click', () => {
    activeFilter = null;
    filterTabs.querySelectorAll('.filter-tab').forEach((tab) => {
      tab.classList.remove('active');
      tab.setAttribute('aria-pressed', 'false');
    });
    allTab.classList.add('active');
    allTab.setAttribute('aria-pressed', 'true');
    search.value = '';
    updateGrid(all);
    try { window.history.replaceState({}, '', '/experiences'); } catch (e) {}
  });
  filterTabs.appendChild(allTab);

  categories.forEach((category) => {
    const isActive = activeFilter === category;
    const tab = h('button', {
      class: `filter-tab${isActive ? ' active' : ''}`,
      type: 'button',
      'aria-pressed': isActive ? 'true' : 'false',
    }, [category]);

    tab.addEventListener('click', () => {
      activeFilter = category;
      filterTabs.querySelectorAll('.filter-tab').forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');
      search.value = '';
      updateGrid(all.filter((entry) => entry.category === category));
      try { window.history.replaceState({}, '', `/experiences?category=${encodeURIComponent(category)}`); } catch (e) {}
    });

    filterTabs.appendChild(tab);
  });

  if (activeFilter) {
    updateGrid(all.filter((entry) => entry.category === activeFilter));
  } else {
    updateGrid(all);
  }

  return h('div', { class: 'container' }, [
    h('section', { class: 'hero hero-subpage hero-subpage--index' }, [
      h('div', { class: 'hero-copy' }, [
        h('p', { class: 'eyebrow' }, ['All experiences']),
        h('h1', {}, ['Experiences']),
        h('p', { class: 'lead' }, ['Browse the full library as a shelf of small illustrated ideas.']),
        h('p', { class: 'hero-supporting' }, ['Each card now carries the collection language it belongs to, so browsing feels more like reading across a publication than sorting through an app.']),
      ]),
    ]),
    search,
    filterTabs,
    grid,
  ]);
}

function renderGrid(container: HTMLElement, entries: ExperienceEntry[]): void {
  container.innerHTML = '';

  if (entries.length === 0) {
    container.appendChild(h('div', { class: 'empty-state' }, [
      h('h3', {}, ['No experiences found']),
      h('p', {}, ['No experiences match your current search and filters.']),
      h('p', { class: 'muted' }, ['Try different keywords or browse by category.']),
    ]));
    return;
  }

  for (const entry of entries) {
    const summary = getReturnSummary(entry.id);
    const progressBadge = summary.completed
      ? h('span', { class: 'badge completed' }, ['Completed'])
      : summary.totalSessions > 0
        ? h('span', { class: 'badge in-progress' }, ['In Progress'])
        : null;

    const duration = entry.estimatedDuration || '2 min';
    const categoryMeta = h('span', {}, [entry.category]);
    const durationMeta = h('span', { class: 'meta-duration' }, [`⏱ ${duration}`]);
    const metaWrapper = h('div', { class: 'meta experience-meta-row' }, [categoryMeta, ' • ', durationMeta]);

    const artwork = renderExperienceHero(entry.id, {
      variant: 'thumbnail',
      className: 'experience-thumb',
      decorative: true,
    });
    const badge = entry.collection ? renderCollectionBadge(entry.collection, 44, 'card-badge-image') : null;
    const identity = entry.collection ? getCollectionIdentity(entry.collection) : null;

    const card = h('article', {
      class: 'card card--experience animate-in',
      style: entry.collection ? getCollectionCSSVariables(entry.collection) : undefined,
      'data-collection': entry.collection,
    }, []);

    if (artwork) {
      card.appendChild(h('div', { class: 'card-figure-wrap' }, [artwork]));
    }

    const headingRow = h('div', { class: 'card-heading-row' }, []);
    if (badge) {
      headingRow.appendChild(badge);
    }
    headingRow.appendChild(h('div', { class: 'card-heading-copy' }, [
      metaWrapper,
      h('h2', {}, [h('a', { href: `/experience/${entry.id}` }, [entry.title])]),
      h('p', { class: 'meta collection-direction' }, [identity?.title || '']),
    ]));
    if (progressBadge) {
      headingRow.appendChild(progressBadge);
    }

    card.appendChild(headingRow);
    card.appendChild(h('p', {}, [entry.summary || entry.description]));
    card.appendChild(h('div', { class: 'card-footer' }, [
      h('p', { class: 'meta' }, [entry.tags?.join(', ') ?? '']),
      summary.totalSessions > 0
        ? h('p', { class: 'meta' }, [`Visited ${summary.totalSessions} time${summary.totalSessions === 1 ? '' : 's'}`])
        : '',
    ]));

    container.appendChild(card);
  }
}
