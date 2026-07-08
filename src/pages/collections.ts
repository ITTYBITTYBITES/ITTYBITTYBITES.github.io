import { getAllCollections, getExperiencesInCollection, getStoryById } from '../platform/registry';
import { getCollectionCompletion, getSuggestedNextExperience } from '../platform/discovery';
import { getProgress, resetAllProgress } from '../platform/lifecycle';
import { getCollectionIdentity } from '../platform/collection-identity';
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
    h('h1', {}, ['Collections']),
    h('p', { class: 'lead' }, ['Experiences connected by meaning. Collections create journeys.']),
  ]);

  collections.forEach((collection) => {
    const experiences = getExperiencesInCollection(collection.id);
    const story = collection.story ? getStoryById(collection.story) : null;
    const completion = getCollectionCompletion(collection.id);
    const suggestedNext = getSuggestedNextExperience(collection.id);

    const isCompleted = completion.percentage === 100;
    const hasStarted = completion.completed > 0 || completion.inProgress > 0;

    // Progress bar
    const progressBar = h('div', { class: 'progress-track' }, [
      h('div', {
        class: 'progress-fill',
        style: `width:${completion.percentage}%`,
        'aria-hidden': 'true'
      }),
    ]);
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-valuenow', String(completion.percentage));
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.setAttribute('aria-label', `${collection.title} completion`);

    // Story intro
    let storySection: HTMLElement | null = null;
    if (story) {
      const introSegment = story.segments?.find(s => s.trigger === 'collection_start');
      const narrativeText = introSegment?.text || story.narrative || story.description;
      storySection = h('div', { class: 'collection-story' }, [
        h('h3', {}, [story.title]),
        h('p', {}, [narrativeText]),
      ]);
    }

    // Experience list with individual progress
    const expList = h('ol', { class: 'collection-experience-list' }, []);
    experiences.forEach((exp, index) => {
      const prog = getProgress(exp.id);
      const expCompleted = prog?.completed;
      const expInProgress = prog && !prog.completed && prog.totalSessions > 0;

      const statusBadge = expCompleted
        ? h('span', { class: 'badge completed' }, ['Completed'])
        : expInProgress
          ? h('span', { class: 'badge in-progress' }, ['In Progress'])
          : h('span', { class: 'badge unstarted' }, ['Not Started']);

      const stepNumber = h('span', { class: 'step-number', 'aria-hidden': 'true' }, [String(index + 1)]);

      const item = h('li', {
        class: `collection-experience-item${expCompleted ? ' is-completed' : ''}${expInProgress ? ' is-active' : ''}`
      }, [
        stepNumber,
        h('div', { class: 'experience-info' }, [
          h('a', { href: `/experience/${exp.id}` }, [exp.title]),
          h('p', {}, [exp.summary || exp.description]),
          h('div', { class: 'experience-meta' }, [
            h('span', {}, [exp.estimatedDuration || '']),
            statusBadge,
          ]),
        ]),
      ]);
      expList.appendChild(item);
    });

    // Action area
    const actions = h('div', { class: 'collection-actions' }, []);

    if (suggestedNext) {
      const btnLabel = hasStarted
        ? (isCompleted ? 'Replay from beginning' : `Continue: ${suggestedNext.title}`)
        : 'Begin Collection';
      const continueBtn = h('a', {
        class: 'btn primary',
        href: `/experience/${suggestedNext.id}`
      }, [btnLabel]);
      actions.appendChild(continueBtn);
    }

    if (hasStarted) {
      const resetBtn = h('button', { class: 'btn subtle', type: 'button' }, ['Reset Progress']);
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all progress for this collection? This cannot be undone.')) {
          resetAllProgress();
          window.location.reload();
        }
      });
      actions.appendChild(resetBtn);
    }

    // Completion state
    let completionBanner: HTMLElement | null = null;
    if (isCompleted) {
      const completionSegment = story?.segments?.find(s => s.trigger === 'collection_complete');
      completionBanner = h('div', { class: 'completion-banner completion-reflection', role: 'status' }, [
        h('h3', {}, ['Collection complete']),
        h('p', {}, [completionSegment?.text || 'You have experienced the full journey. Return to any experience and you will find it deeper than before.']),
        h('p', { class: 'meta' }, ['A quiet acknowledgement — no points, no rush.']),
      ]);
    }

    // Apply collection identity theme
    const identity = getCollectionIdentity(collection.id);
    const cardStyle = identity 
      ? `background: ${identity.theme.backgroundGradient}; border-left: 4px solid ${identity.theme.primaryColor};`
      : '';

    const card = h('article', { class: 'collection-card', 'data-collection': collection.id, style: cardStyle }, [
      h('header', { class: 'collection-header' }, [
        h('h2', {}, [identity ? `${identity.theme.icon} ${collection.title}` : collection.title]),
        h('p', {}, [collection.description]),
        h('div', { class: 'collection-meta' }, [
          h('span', {}, [`${experiences.length} experiences`]),
          h('span', {}, [collection.estimatedDuration || '']),
          h('span', {}, [`${completion.percentage}% complete`]),
        ]),
        progressBar,
      ]),
      storySection,
      h('div', { class: 'collection-body' }, [
        h('h3', {}, ['Experiences']),
        expList,
      ]),
      completionBanner,
      actions,
    ].filter(Boolean) as any);

    container.appendChild(card);
  });

  return container;
}
