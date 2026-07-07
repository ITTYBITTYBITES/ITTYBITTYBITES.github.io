import { getAllCollections, getExperiencesInCollection } from '../platform/registry';
import { h } from '../platform/utils';

export function renderCollections(): HTMLElement {
  const collections = getAllCollections();

  if (collections.length === 0) {
    return h('div', { class: 'container' }, [
      h('h1', {}, ['Collections']),
      h('p', {}, ['Collections are still forming. The first one will appear soon.']),
    ]);
  }

  const list = h('div', { class: 'collections-grid' }, []);

  collections.forEach((collection) => {
    const experiences = getExperiencesInCollection(collection.id);

    const expList = experiences.length > 0 
      ? h('ul', {}, experiences.map(exp => 
          h('li', {}, [
            h('a', { href: `/experience/${exp.id}` }, [exp.title])
          ])
        ))
      : h('p', { class: 'muted' }, ['No experiences yet in this collection.']);

    const card = h('div', { class: 'collection-detail' }, [
      h('h2', {}, [collection.title]),
      h('p', {}, [collection.description]),
      h('div', { class: 'section' }, [
        h('h3', {}, ['Experiences in this collection']),
        expList,
      ]),
    ]);

    list.appendChild(card);
  });

  return h('div', { class: 'container' }, [
    h('h1', {}, ['Collections']),
    h('p', {}, [
      'Experiences connected by meaning. ',
      'Collections create Discovery.'
    ]),
    list,
  ]);
}
