import { getAllCollections, getExperiencesInCollection, getStoryById } from '../platform/registry';
import { getCollectionCompletion, getSuggestedNextExperience } from '../platform/discovery';
import { getProgress, resetAllProgress } from '../platform/lifecycle';
import {
  getCollectionIdentity,
  getCollectionCSSVariables,
  renderCollectionBadge,
  renderCollectionCover,
} from '../platform/collection-identity';
import { renderExperienceHero } from '../platform/illustration-system';
import { h } from '../platform/utils';

export function renderCollections(): HTMLElement {
  const collections = getAllCollections();

  if (collections.length === 0) {
    return h('div', { class: 'container' }, [
      h('h1', {}, ['Collections']),
      h('p', {}, ['Collections are still forming. The first one will appear soon.']),
    ]);
  }

  const container = h('div', { class: 'container' }, [
    h('section', { class: 'hero hero-subpage' }, [
      h('div', { class: 'hero-copy' }, [
        h('p', { class: 'eyebrow' }, ['Illustrated volumes']),
        h('h1', {}, ['Collections']),
        h('p', { class: 'lead' }, ['Experiences connected by meaning. Collections create journeys.']),
        h('p', { class: 'hero-supporting' }, ['Each collection now carries a permanent illustration language so the shelf reads like a library of authored books rather than a stack of unrelated pages.']),
      ]),
    ]),
  ]);

  collections.forEach((collection) => {
    const experiences = getExperiencesInCollection(collection.id);
    const story = collection.story ? getStoryById(collection.story) : null;
    const completion = getCollectionCompletion(collection.id);
    const suggestedNext = getSuggestedNextExperience(collection.id);
    const identity = getCollectionIdentity(collection.id);

    const isCompleted = completion.percentage === 100;
    const hasStarted = completion.completed > 0 || completion.inProgress > 0;

    const progressBar = h('div', { class: 'progress-track' }, [
      h('div', {
        class: 'progress-fill',
        style: `width:${completion.percentage}%`,
        'aria-hidden': 'true',
      }),
    ]);
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-valuenow', String(completion.percentage));
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.setAttribute('aria-label', `${collection.title} completion`);

    let storySection: HTMLElement | null = null;
    if (story) {
      const introSegment = story.segments?.find((segment) => segment.trigger === 'collection_start');
      const narrativeText = introSegment?.text || story.narrative || story.description;
      storySection = h('div', { class: 'collection-story publication-panel' }, [
        h('h3', {}, [story.title]),
        h('p', {}, [narrativeText]),
      ]);
    }

    const expList = h('ol', { class: 'collection-experience-list' }, []);
    experiences.forEach((experience, index) => {
      const progress = getProgress(experience.id);
      const experienceCompleted = progress?.completed;
      const experienceInProgress = Boolean(progress && !progress.completed && progress.totalSessions > 0);

      const statusBadge = experienceCompleted
        ? h('span', { class: 'badge completed' }, ['Completed'])
        : experienceInProgress
          ? h('span', { class: 'badge in-progress' }, ['In Progress'])
          : h('span', { class: 'badge unstarted' }, ['Not Started']);

      const artwork = renderExperienceHero(experience.id, {
        variant: 'thumbnail',
        className: 'experience-thumb experience-thumb--list',
        decorative: true,
      });

      const item = h('li', {
        class: `collection-experience-item${experienceCompleted ? ' is-completed' : ''}${experienceInProgress ? ' is-active' : ''}`,
        style: getCollectionCSSVariables(collection.id),
        'data-collection': collection.id,
      }, []);

      item.appendChild(h('div', { class: 'step-number', 'aria-hidden': 'true' }, [String(index + 1)]));
      if (artwork) {
        item.appendChild(h('div', { class: 'collection-list-artwork' }, [artwork]));
      }
      item.appendChild(h('div', { class: 'experience-info' }, [
        h('a', { href: `/experience/${experience.id}` }, [experience.title]),
        h('p', {}, [experience.summary || experience.description]),
        h('div', { class: 'experience-meta' }, [
          h('span', { class: 'meta-duration' }, [`⏱ ${experience.estimatedDuration || '2 min'}`]),
          statusBadge,
        ]),
      ]));

      expList.appendChild(item);
    });

    const actions = h('div', { class: 'collection-actions' }, []);
    if (suggestedNext) {
      const buttonLabel = hasStarted
        ? (isCompleted ? 'Replay from beginning' : `Continue: ${suggestedNext.title}`)
        : 'Begin Collection';
      actions.appendChild(h('a', {
        class: 'btn primary',
        href: `/experience/${suggestedNext.id}`,
      }, [buttonLabel]));
    }

    if (hasStarted) {
      const resetButton = h('button', { class: 'btn subtle', type: 'button' }, ['Reset Progress']);
      resetButton.addEventListener('click', () => {
        if (confirm('Reset all progress for this collection? This cannot be undone.')) {
          resetAllProgress();
          window.location.reload();
        }
      });
      actions.appendChild(resetButton);
    }

    const completionBanner = isCompleted
      ? h('div', { class: 'completion-banner completion-reflection', role: 'status' }, [
          h('h3', {}, ['Collection complete']),
          h('p', {}, [story?.segments?.find((segment) => segment.trigger === 'collection_complete')?.text || 'You have experienced the full journey. Return to any experience and you will find it deeper than before.']),
          h('p', { class: 'meta' }, ['A quiet acknowledgement — no points, no rush.']),
        ])
      : null;

    const badge = renderCollectionBadge(collection.id, 72, 'collection-badge-image');
    const illustration = renderCollectionCover(collection.id, { variant: 'cover', className: 'collection-cover-image' });

    const card = h('article', {
      class: 'collection-card publication-panel',
      id: collection.id,
      style: getCollectionCSSVariables(collection.id),
      'data-collection': collection.id,
    }, []);

    const header = h('header', { class: 'collection-header collection-header--authored' }, [
      h('div', { class: 'collection-header-copy' }, [
        h('div', { class: 'collection-title-row' }, [
          ...(badge ? [badge] : []),
          h('div', {}, [
            h('h2', {}, [collection.title]),
            h('p', { class: 'meta collection-direction' }, [identity?.direction || '']),
          ]),
        ]),
        h('p', {}, [collection.description]),
        h('div', { class: 'collection-meta' }, [
          h('span', {}, [`${experiences.length} experiences`]),
          h('span', {}, [collection.estimatedDuration || '']),
          h('span', {}, [`${completion.percentage}% complete`]),
        ]),
        progressBar,
      ]),
    ]);

    if (illustration) {
      header.appendChild(h('div', { class: 'collection-header-art' }, [illustration]));
    }

    card.appendChild(header);
    if (storySection) card.appendChild(storySection);
    card.appendChild(h('div', { class: 'collection-body' }, [
      h('h3', {}, ['Experiences']),
      expList,
    ]));
    if (completionBanner) card.appendChild(completionBanner);
    card.appendChild(actions);

    container.appendChild(card);
  });

  return container;
}
