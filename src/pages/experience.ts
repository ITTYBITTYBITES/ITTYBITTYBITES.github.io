import { ExperienceHost } from '../components/experience-host';
import { getExperienceById } from '../platform/registry';
import type { RouteParams } from '../platform/router';
import { h } from '../platform/utils';

export function renderExperience({ params, query }: RouteParams): HTMLElement {
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

  return h('div', { class: 'container' }, [
    h('header', { class: 'page-header' }, [
      h('div', { class: 'meta' }, [entry.category]),
      h('h1', {}, [entry.title]),
      h('p', {}, [entry.description]),
    ]),
    host,
  ]);
}
