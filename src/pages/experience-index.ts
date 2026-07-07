import { events } from '../platform/events';
import { getAllExperiences } from '../platform/registry';
import type { ExperienceEntry } from '../platform/registry-types';
import { getReturnSummary } from '../platform/lifecycle';
import { debounce, h } from '../platform/utils';


export function renderIndex(): HTMLElement {
  const all = getAllExperiences();

  const grid = h('div', { class: 'grid' }, []);
  const search = h('input', {
    class: 'search-input',
    type: 'search',
    placeholder: 'Search experiences…',
    'aria-label': 'Search experiences',
  });

  const updateGrid = (term: string): void => {
    const filtered = filterExperiences(all, term);
    renderGrid(grid, filtered);
    if (term.trim()) {
      events.emit('search_used', { term: term.trim(), result_count: filtered.length });
    }
  };

  const debouncedUpdate = debounce(updateGrid, 250);
  search.addEventListener('input', () => debouncedUpdate(search.value));

  updateGrid('');

  return h('div', { class: 'container' }, [
    h('h1', {}, ['Experiences']),
    h('p', {}, ['Browse the experiences registered on the platform.']),
    search,
    grid,
  ]);
}

function filterExperiences(entries: ExperienceEntry[], term: string): ExperienceEntry[] {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return entries;
  return entries.filter((entry) => {
    const text = `${entry.title} ${entry.description} ${entry.category} ${entry.tags?.join(' ') ?? ''} ${entry.searchKeywords?.join(' ') ?? ''}`;
    return text.toLowerCase().includes(normalized);
  });
}

function renderGrid(container: HTMLElement, entries: ExperienceEntry[]): void {
  container.innerHTML = '';
  if (entries.length === 0) {
    container.appendChild(h('div', { class: 'empty-state' }, [
      h('p', {}, ['No experiences match your search.']),
      h('p', { class: 'muted' }, ['Try different keywords or browse all experiences.']),
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

    const card = h('article', { class: 'card' }, cardChildren);
    container.appendChild(card);
  }
}
