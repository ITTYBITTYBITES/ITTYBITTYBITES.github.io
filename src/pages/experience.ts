import { ExperienceHost } from '../components/experience-host';
import { getExperienceById, getStoryById, getCollectionById } from '../platform/registry';
import { getNextSteps } from '../platform/discovery';
import { getReturnSummary, markExperienceCompleted } from '../platform/lifecycle';
import {
  getCollectionIdentity,
  getCollectionCSSVariables,
  renderCollectionBadge,
} from '../platform/collection-identity';
import { renderExperienceFigure } from '../platform/illustration-system';
import { h } from '../platform/utils';
import { feedback } from '../platform/feedback';

export function renderExperience({ params, query }: { params: Record<string, string>; query: URLSearchParams }): HTMLElement {
  const id = params.id;
  const entry = getExperienceById(id);

  if (!entry) {
    return h('div', { class: 'container' }, [
      h('h1', {}, ['Experience not found']),
      h('p', {}, [
        'No experience is registered with id “',
        h('code', {}, [id]),
        '”. ',
        h('a', { href: '/experiences' }, ['Browse all experiences']),
      ]),
    ]);
  }

  const host = document.createElement('experience-host') as ExperienceHost;
  host.dataset.id = entry.id;
  host.dataset.query = query.toString();

  const next = getNextSteps(entry.id);
  const returnSummary = getReturnSummary(entry.id);
  const collection = entry.collection ? getCollectionById(entry.collection) : null;
  const collectionIdentity = collection ? getCollectionIdentity(collection.id) : null;

  let storyTransition: HTMLElement | null = null;
  if (entry.story) {
    const story = getStoryById(entry.story);
    if (story?.segments) {
      const segment = story.segments.find((item) => item.trigger === `after_${entry.id}`);
      if (segment) {
        storyTransition = h('div', { class: 'story-transition publication-panel' }, [
          h('h3', {}, [segment.title]),
          h('p', {}, [segment.text]),
        ]);
      }
    }
  }

  const header = h('header', { class: 'page-header page-header--experience' }, []);
  const copy = h('div', { class: 'page-header-copy' }, [
    h('div', { class: 'meta' }, [entry.category]),
  ]);

  if (collection) {
    const badge = renderCollectionBadge(collection.id, 56, 'collection-badge-image');
    const context = h('div', {
      class: 'collection-context collection-context--badge',
      style: getCollectionCSSVariables(collection.id),
      'data-collection': collection.id,
    }, []);
    if (badge) {
      context.appendChild(badge);
    }
    context.appendChild(h('div', {}, [
      h('span', { class: 'meta' }, ['Part of collection']),
      h('strong', {}, [collection.title]),
      h('p', { class: 'collection-direction' }, [collectionIdentity?.direction || '']),
    ]));
    copy.appendChild(context);
  }

  copy.appendChild(h('h1', {}, [entry.title]));
  copy.appendChild(h('p', { class: 'lead' }, [entry.description]));
  if (entry.estimatedDuration) {
    copy.appendChild(h('p', { class: 'meta' }, [`Estimated time: ${entry.estimatedDuration}`]));
  }

  header.appendChild(copy);

  const figure = renderExperienceFigure(entry.id, entry.title);
  if (figure) {
    header.appendChild(figure);
  }

  const elements: HTMLElement[] = [header, host];

  if (storyTransition) {
    elements.push(storyTransition);
  }

  if (next.collection) {
    elements.push(h('p', { class: 'collection-context' }, [
      'Part of ',
      h('a', { href: '/collections' }, [next.collection.title]),
    ]));
  }

  if (returnSummary.totalSessions > 0) {
    const returnText = returnSummary.completed
      ? `Completed • Visited ${returnSummary.totalSessions} time${returnSummary.totalSessions === 1 ? '' : 's'}`
      : `Visited ${returnSummary.totalSessions} time${returnSummary.totalSessions === 1 ? '' : 's'}`;
    elements.push(h('p', { class: 'return-context' }, [returnText]));
  }

  const completeButton = h('button', {
    class: 'btn subtle complete-signal',
    type: 'button',
    'aria-describedby': 'complete-help',
  }, ['Mark complete — I explored this']);

  const completeHelp = h('p', {
    id: 'complete-help',
    class: 'meta',
    style: 'font-size:0.8rem;margin-top:0.25rem;',
  }, ['Completing is a quiet acknowledgement, not a score.']);

  completeButton.addEventListener('click', () => {
    markExperienceCompleted(entry.id);
    feedback.complete(completeButton as HTMLElement, 'Experience marked complete. Thank you for your attention.');
    completeButton.textContent = 'Completed — noted';
    completeButton.setAttribute('disabled', 'true');
    completeButton.classList.add('completion-acknowledged');

    const reflection = h('div', { class: 'completion-reflection', role: 'status', 'aria-live': 'polite' }, [
      h('h3', {}, ['Complete']),
      h('p', {}, ['You took time with this. What will you carry forward?']),
      h('p', { class: 'meta' }, ['Return any time — the experience will remember your progress.']),
    ]);

    const container = completeButton.closest('.complete-action') || completeButton.parentElement;
    if (container && !container.querySelector('.completion-reflection')) {
      container.appendChild(reflection);
    }
  });

  elements.push(h('div', { class: 'complete-action' }, [completeButton, completeHelp]));

  if (next.nextInCollection) {
    elements.push(h('div', { class: 'next-step' }, [
      h('h4', {}, ['Next in this collection']),
      h('a', { class: 'btn primary', href: `/experience/${next.nextInCollection.id}` }, [`Continue to ${next.nextInCollection.title}`]),
    ]));
  } else if (next.related && next.related.length > 0) {
    elements.push(h('div', { class: 'next-step' }, [
      h('h4', {}, ['Related in this collection']),
      h('ul', { class: 'suggestion-list' }, next.related.map((related: any) =>
        h('li', {}, [h('a', { href: `/experience/${related.id}` }, [related.title])])
      )),
    ]));
  } else if (returnSummary.completed) {
    elements.push(h('div', { class: 'completion-banner completion-reflection', role: 'status' }, [
      h('h3', {}, ['Complete']),
      h('p', {}, ['You explored this thoroughly. Take a moment — what stood out?']),
      h('p', { class: 'meta' }, [
        `Visited ${returnSummary.totalSessions} time${returnSummary.totalSessions === 1 ? '' : 's'}.`,
        ' Your progress is saved locally.',
      ]),
      h('div', { class: 'cta-row', style: 'margin-top:1rem;' }, [
        h('a', { class: 'btn subtle', href: '/library' }, ['Return to Library']),
        h('a', { class: 'btn', href: '/collections' }, ['Continue exploring']),
      ]),
    ]));
  }

  return h('div', {
    class: 'container',
    style: collection ? getCollectionCSSVariables(collection.id) : undefined,
    'data-collection': collection?.id,
  }, elements);
}
