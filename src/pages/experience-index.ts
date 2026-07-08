import { events } from '../platform/events';
import { getAllExperiences } from '../platform/registry';
import type { ExperienceEntry } from '../platform/registry-types';
import { getReturnSummary } from '../platform/lifecycle';
import { searchExperiences } from '../platform/search';
import { debounce, h } from '../platform/utils';

export function renderIndex(): HTMLElement {
  const all = getAllExperiences();

  const grid = h('div', { class: 'grid' }, []);
  const search = h('input', {
    class: 'search-input',
    type: 'search',
    placeholder: 'Search experiences by title, description, keywords…',
    'aria-label': 'Search experiences',
  });

  const filterTabs = h('div', { class: 'filter-tabs' }, []);
  const categories = [...new Set(all.map(e => e.category))].sort();
  let activeFilter: string | null = null;

  const updateGrid = (entries: ExperienceEntry[]): void => {
    renderGrid(grid, entries);
  };

  const updateSearch = (term: string): void => {
    if (!term.trim()) {
      updateGrid(activeFilter ? all.filter(e => e.category === activeFilter) : all);
      return;
    }
    const results = searchExperiences(term);
    const matchedIds = new Set(results.map(r => r.id));
    const filtered = all.filter(e => matchedIds.has(e.id));
    updateGrid(filtered);
    events.emit('search_used', { term: term.trim(), result_count: filtered.length });
  };

  const debouncedSearch = debounce(updateSearch, 150);
  search.addEventListener('input', () => debouncedSearch(search.value));

  // Build filter tabs
  const allTab = h('button', {
    class: 'filter-tab active',
    type: 'button',
    'aria-pressed': 'true',
  }, ['All']);
  allTab.addEventListener('click', () => {
    activeFilter = null;
    filterTabs.querySelectorAll('.filter-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-pressed', 'false');
    });
    allTab.classList.add('active');
    allTab.setAttribute('aria-pressed', 'true');
    search.value = '';
    updateGrid(all);
  });
  filterTabs.appendChild(allTab);

  categories.forEach(cat => {
    const tab = h('button', {
      class: 'filter-tab',
      type: 'button',
      'aria-pressed': 'false',
    }, [cat]);
    tab.addEventListener('click', () => {
      activeFilter = cat;
      filterTabs.querySelectorAll('.filter-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');
      search.value = '';
      updateGrid(all.filter(e => e.category === cat));
    });
    filterTabs.appendChild(tab);
  });

  updateGrid(all);

  return h('div', { class: 'container' }, [
    h('h1', {}, ['Experiences']),
    h('p', {}, ['Browse and search all experiences on the platform.']),
    search,
    filterTabs,
    grid,
  ]);
}

function renderGrid(container: HTMLElement, entries: ExperienceEntry[]): void {
  container.innerHTML = '';
  if (entries.length === 0) {
    container.appendChild(h('div', { class: 'empty-state animate-in' }, [
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

    const metaItems: string[] = [entry.category];
    if (entry.estimatedDuration) metaItems.push(entry.estimatedDuration);

    const cardChildren: (string | Node)[] = [
      h('div', { class: 'card-header' }, [
        h('div', { class: 'meta' }, [metaItems.join(' • ')]),
        progressBadge || '',
      ]),
      h('h2', {}, [h('a', { href: `/experience/${entry.id}` }, [entry.title])]),
      h('p', {}, [entry.summary || entry.description]),
      h('div', { class: 'card-footer' }, [
        h('p', { class: 'meta' }, [entry.tags?.join(', ') ?? '']),
        summary.totalSessions > 0
          ? h('p', { class: 'meta' }, [`Visited ${summary.totalSessions} time${summary.totalSessions === 1 ? '' : 's'}`])
          : '',
      ]),
    ];

    const card = h('article', { class: 'card animate-in' }, cardChildren);
    container.appendChild(card);
  }
}
