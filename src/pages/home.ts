import { h } from '../platform/utils';
import { getAllCollections, getAllStories } from '../platform/registry';
import { getContinueExploringSuggestions } from '../platform/discovery';
export function renderHome(): HTMLElement {
  const collections = getAllCollections();
  const stories = getAllStories();
  const continueSuggestions = getContinueExploringSuggestions(3);
  const collectionList = collections.length > 0 ? h('ul', {}, collections.map(c => h('li', {}, [h('strong', {}, [c.title]), ' — ', c.description]))) : h('p', { class: 'muted' }, ['Collections are forming.']);
  const storyList = stories.length > 0 ? h('ul', {}, stories.map(s => h('li', {}, [h('strong', {}, [s.title]), ' — ', s.description]))) : h('p', { class: 'muted' }, ['Stories are beginning.']);
  const continueSection = continueSuggestions.length > 0 ? h('section', { class: 'section discovery' }, [h('h2', {}, ['Continue exploring']), h('p', { class: 'muted' }, ['Pick up where you left off or build on what you started.']), h('ul', { class: 'suggestion-list' }, continueSuggestions.map((s: any) => h('li', {}, [h('a', { href: `/experience/${s.experience.id}` }, [s.experience.title]), ' — ', h('span', { class: 'reason' }, [s.reason])])) )]) : null;
  return h('div', { class: 'container' }, [h('section', { class: 'hero' }, [h('h1', {}, ['The Experience Platform']), h('p', { class: 'lead' }, ['We build things worth returning to.']), h('p', {}, ['Small, meaningful interactions create lasting experiences. ', 'Experiences create Collections. Collections create Discovery. Discovery creates the Platform.']), h('div', { class: 'cta-row' }, [h('a', { class: 'btn', href: '/experiences' }, ['Begin with the first experience']), h('a', { class: 'btn subtle', href: '/collections' }, ['Explore collections'])])]), continueSection, h('section', { class: 'section' }, [h('h2', {}, ['Foundations']), h('p', {}, ['Every platform begins with a single interaction. ', 'Echo Chamber is the first coherent experience — a living mirror that listens, returns, and evolves with you.'])]), h('section', { class: 'section' }, [h('h2', {}, ['Collections']), h('p', {}, ['Experiences connected by meaning and purpose.']), collectionList]), h('section', { class: 'section' }, [h('h2', {}, ['Stories']), h('p', {}, ['The human context behind what we build.']), storyList])].filter(Boolean) as any);
}
