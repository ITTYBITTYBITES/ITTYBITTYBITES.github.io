import { h } from '../platform/utils';
import { getAllCollections, getAllStories } from '../platform/registry';
import { getContinueExploringSuggestions, getCollectionCompletion } from '../platform/discovery';
export function renderHome(): HTMLElement {
  const collections = getAllCollections();
  const stories = getAllStories();
  const continueSuggestions = getContinueExploringSuggestions(3);

  // Hero
  const hero = h('section', { class: 'hero' }, [
    h('h1', {}, ['The Experience Platform']),
    h('p', { class: 'lead' }, ['We build things worth returning to.']),
    h('p', {}, [
      'Small, meaningful interactions create lasting experiences. ',
      'Experiences create Collections. Collections create Discovery. Discovery creates the Platform.'
    ]),
    h('div', { class: 'cta-row' }, [
      h('a', { class: 'btn', href: '/collections' }, ['Explore Foundations']),
      h('a', { class: 'btn subtle', href: '/experiences' }, ['Browse all experiences']),
    ]),
  ]);

  // Continue exploring
  let continueSection: HTMLElement | null = null;
  if (continueSuggestions.length > 0) {
    continueSection = h('section', { class: 'section discovery' }, [
      h('h2', {}, ['Continue exploring']),
      h('p', { class: 'muted' }, ['Pick up where you left off or build on what you started.']),
      h('ul', { class: 'suggestion-list' }, continueSuggestions.map((s: any) =>
        h('li', {}, [
          h('a', { href: `/experience/${s.experience.id}` }, [s.experience.title]),
          ' — ',
          h('span', { class: 'reason' }, [s.reason]),
        ])
      )),
    ]);
  }

  // Collections overview with progress
  const collectionCards = collections.map(c => {
    const completion = getCollectionCompletion(c.id);
    const progressBar = h('div', { class: 'progress-track small' }, [
      h('div', {
        class: 'progress-fill',
        style: `width:${completion.percentage}%`,
        'aria-hidden': 'true'
      }),
    ]);

    return h('article', { class: 'card collection-card-compact' }, [
      h('h3', {}, [h('a', { href: '/collections' }, [c.title])]),
      h('p', {}, [c.description]),
      h('div', { class: 'collection-meta-row' }, [
        h('span', { class: 'meta' }, [`${c.experiences.length} experiences`]),
        h('span', { class: 'meta' }, [c.estimatedDuration || '']),
      ]),
      progressBar,
      h('div', { class: 'meta' }, [`${completion.percentage}% complete`]),
    ]);
  });

  const collectionsSection = h('section', { class: 'section' }, [
    h('h2', {}, ['Collections']),
    h('p', {}, ['Experiences connected by meaning and purpose.']),
    h('div', { class: 'grid' }, collectionCards),
  ]);

  // Stories
  const storyList = stories.length > 0
    ? h('ul', { class: 'story-list' }, stories.map(s =>
        h('li', {}, [
          h('strong', {}, [s.title]),
          ' — ',
          s.description,
        ])
      ))
    : h('p', { class: 'muted' }, ['Stories are beginning.']);

  const storiesSection = h('section', { class: 'section' }, [
    h('h2', {}, ['Stories']),
    h('p', {}, ['The human context behind what we build.']),
    storyList,
  ]);

  const children: HTMLElement[] = [hero];
  if (continueSection) children.push(continueSection);
  children.push(collectionsSection, storiesSection);

  return h('div', { class: 'container' }, children);
}
