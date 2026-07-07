import { events } from '../platform/events';
import { getAllExperiences } from '../platform/registry';
import type { ExperienceEntry } from '../platform/registry-types';
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
    h('p', {}, ['Browse the sample experiences registered on the platform.']),
    search,
    grid,
  ]);
}

function filterExperiences(entries: ExperienceEntry[], term: string): ExperienceEntry[] {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return entries;
  return entries.filter((entry) => {
    const text = `${entry.title} ${entry.description} ${entry.category} ${entry.tags?.join(' ') ?? ''}`;
    return text.toLowerCase().includes(normalized);
  });
}

function renderGrid(container: HTMLElement, entries: ExperienceEntry[]): void {
  container.innerHTML = '';
  if (entries.length === 0) {
    container.appendChild(h('p', {}, ['No experiences match your search.']));
    return;
  }
  for (const entry of entries) {
    container.appendChild(
      h('article', { class: 'card' }, [
        h('div', { class: 'meta' }, [entry.category]),
        h('h2', {}, [h('a', { href: `/experience/${entry.id}` }, [entry.title])]),
        h('p', {}, [entry.description]),
        h('p', { class: 'meta' }, [entry.tags?.join(', ') ?? '']),
      ])
    );
  }
}
