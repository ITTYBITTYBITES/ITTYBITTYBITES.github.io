import { ExperienceHost } from '../components/experience-host';
import { getExperienceById } from '../platform/registry';
import { getNextSteps } from '../platform/discovery';
import { getReturnSummary } from '../platform/lifecycle';
import { h } from '../platform/utils';

export function renderExperience({ params, query }: { params: Record<string, string>; query: URLSearchParams }): HTMLElement {
  const id = params.id;
  const entry = getExperienceById(id);

  if (!entry) {
    return h('div', { class: 'container' }, [
      h('h1', {}, ['Experience not found']),
      h('p', {}, [
        'No experience is registered with id "',
        h('code', {}, [id]),
        '". ',
        h('a', { href: '/experiences' }, ['Browse all experiences']),
      ]),
    ]);
  }

  const host = document.createElement('experience-host') as ExperienceHost;
  host.dataset.id = entry.id;
  host.dataset.query = query.toString();

  const next = getNextSteps(entry.id);
  const returnSummary = getReturnSummary(entry.id);

  const elements: any[] = [
    h('header', { class: 'page-header' }, [
      h('div', { class: 'meta' }, [entry.category]),
      h('h1', {}, [entry.title]),
      h('p', {}, [entry.description]),
    ]),
    host,
  ];

  if (next.collection) {
    elements.push(
      h('p', {}, [
        'Part of ',
        h('a', { href: '/collections' }, [next.collection.title]),
      ])
    );
  }

  if (returnSummary.totalSessions > 0) {
    elements.push(
      h('p', { class: 'return-context' }, [
        `You have visited ${returnSummary.totalSessions} time${returnSummary.totalSessions === 1 ? '' : 's'}.`,
      ])
    );
  }

  if (next.related && next.related.length > 0) {
    elements.push(
      h('div', {}, [
        h('h4', {}, ['Related in this collection']),
        h('ul', {}, next.related.map((r: any) =>
          h('li', {}, [h('a', { href: `/experience/${r.id}` }, [r.title])])
        ))
      ])
    );
  }

  return h('div', { class: 'container' }, elements);
}
