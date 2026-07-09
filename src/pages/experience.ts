import { ExperienceHost } from '../components/experience-host';
import { getExperienceById, getStoryById, getCollectionById } from '../platform/registry';
import { getNextSteps } from '../platform/discovery';
import { getReturnSummary, markExperienceCompleted, toggleFavorite } from '../platform/lifecycle';
import { events } from '../platform/events';
import {
  getCollectionIdentity,
  getCollectionCSSVariables,
  renderCollectionBadge,
} from '../platform/collection-identity';
import { renderExperienceFigure, EXP_SLUG_TO_DIR, renderBookmarkIcon } from '../platform/illustration-system';
import { clearElement, h, updateMetaTags } from '../platform/utils';
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

  // Update SEO for deep-links
  const dirName = EXP_SLUG_TO_DIR[entry.id];
  updateMetaTags(
    `${entry.title} — ITTYBITTYBITES`,
    entry.summary || entry.description,
    dirName ? `assets/library/experiences/${dirName}/hero.svg` : undefined
  );

  const next = getNextSteps(entry.id);
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

  const footerWrap = h('div', { class: 'experience-footer-wrap' }, []);
  elements.push(footerWrap);

  const renderFooter = () => {
    clearElement(footerWrap);
    const currentSummary = getReturnSummary(entry.id);
    
    if (currentSummary.completed) {
      let nextTitle = 'Continue exploring';
      let nextHref = '/collections';
      
      if (next.nextInCollection) {
        nextTitle = `Continue to ${next.nextInCollection.title}`;
        nextHref = `/experience/${next.nextInCollection.id}`;
      } else if (next.related && next.related.length > 0) {
        nextTitle = `Explore ${next.related[0].title}`;
        nextHref = `/experience/${next.related[0].id}`;
      }

      const isFavorite = currentSummary.isFavorite ?? false;
      const saveBtn = h('button', { 
        class: `btn subtle toggle-save ${isFavorite ? 'is-favorite' : ''}`, 
        'aria-pressed': String(isFavorite) 
      }, [
        renderBookmarkIcon('bookmark-icon', true),
        isFavorite ? ' Saved to Library' : ' Save to Library'
      ]);

      saveBtn.addEventListener('click', () => {
        const nowFavorite = toggleFavorite(entry.id);
        saveBtn.setAttribute('aria-pressed', String(nowFavorite));
        saveBtn.classList.toggle('is-favorite', nowFavorite);
        saveBtn.innerHTML = '';
        saveBtn.appendChild(renderBookmarkIcon('bookmark-icon', true));
        saveBtn.appendChild(document.createTextNode(nowFavorite ? ' Saved to Library' : ' Save to Library'));
      });

      const successBanner = h('div', { class: 'completion-banner publication-panel animate-in', role: 'status' }, [
        h('h3', {}, ['Experience Complete']),
        h('p', {}, [`You just practiced concepts in ${entry.category.toLowerCase()}.`]),
        h('div', { class: 'cta-row', style: 'margin-top:1.5rem;' }, [
          h('a', { class: 'btn primary', href: nextHref }, [nextTitle]),
          saveBtn,
        ])
      ]);
      
      footerWrap.appendChild(successBanner);
    } else {
      const completeButton = h('button', {
        class: 'btn subtle complete-signal',
        type: 'button',
      }, ['Mark complete — I explored this']);

      completeButton.addEventListener('click', () => {
        markExperienceCompleted(entry.id);
        feedback.complete(completeButton as HTMLElement, 'Experience marked complete.');
        renderFooter();
      });

      footerWrap.appendChild(h('div', { class: 'complete-action' }, [completeButton]));
    }
  };

  renderFooter();

  // Listen for dynamic completion events from the host (e.g. solving a puzzle)
  const dynamicCompletionHandler = (e: CustomEvent) => {
    if (e.detail?.experience_id === entry.id) {
      renderFooter();
    }
  };
  events.on('experience_completed', dynamicCompletionHandler);

  // Clean up listener when navigating away
  const observer = new MutationObserver(() => {
    if (!document.body.contains(footerWrap)) {
      events.off('experience_completed', dynamicCompletionHandler);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return h('div', {
    class: 'container',
    style: collection ? getCollectionCSSVariables(collection.id) : undefined,
    'data-collection': collection?.id,
  }, elements);
}
