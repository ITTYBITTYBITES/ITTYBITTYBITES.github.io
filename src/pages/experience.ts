import { ExperienceHost } from '../components/experience-host';
import { getExperienceById, getStoryById } from '../platform/registry';
import { getNextSteps } from '../platform/discovery';
import { getReturnSummary, markExperienceCompleted } from '../platform/lifecycle';
import { h } from '../platform/utils';
import { feedback } from '../platform/feedback';

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

  // Story transition
  let storyTransition: HTMLElement | null = null;
  if (entry.story) {
    const story = getStoryById(entry.story);
    if (story?.segments) {
      // Find transition for this experience
      const segment = story.segments.find(s => s.trigger === `after_${entry.id}`);
      if (segment) {
        storyTransition = h('div', { class: 'story-transition' }, [
          h('h3', {}, [segment.title]),
          h('p', {}, [segment.text]),
        ]);
      }
    }
  }

  const headerChildren: (string | Node)[] = [
    h('div', { class: 'meta' }, [entry.category]),
    h('h1', {}, [entry.title]),
    h('p', {}, [entry.description]),
  ];
  if (entry.estimatedDuration) {
    headerChildren.push(h('p', { class: 'meta' }, [`Estimated time: ${entry.estimatedDuration}`]));
  }

  const elements: HTMLElement[] = [
    h('header', { class: 'page-header' }, headerChildren),
    host,
  ];

  if (storyTransition) {
    elements.push(storyTransition);
  }

  if (next.collection) {
    elements.push(
      h('p', { class: 'collection-context' }, [
        'Part of ',
        h('a', { href: '/collections' }, [next.collection.title]),
      ])
    );
  }

  if (returnSummary.totalSessions > 0) {
    const returnText = returnSummary.completed
      ? `Completed • Visited ${returnSummary.totalSessions} time${returnSummary.totalSessions === 1 ? '' : 's'}`
      : `Visited ${returnSummary.totalSessions} time${returnSummary.totalSessions === 1 ? '' : 's'}`;
    elements.push(
      h('p', { class: 'return-context' }, [returnText])
    );
  }

  // Mark complete button for experiences that don't self-report
  const completeBtn = h('button', { class: 'btn subtle complete-signal', type: 'button', 'aria-describedby': 'complete-help' }, ['Mark complete — I explored this']);
  const completeHelp = h('p', { id: 'complete-help', class: 'meta', style: 'font-size:0.8rem;margin-top:0.25rem;' },
    ['Completing is a quiet acknowledgement, not a score.']);
  completeBtn.addEventListener('click', () => {
    markExperienceCompleted(entry.id);
    feedback.complete(completeBtn as HTMLElement, 'Experience marked complete. Thank you for your attention.');
    completeBtn.textContent = 'Completed — noted';
    completeBtn.setAttribute('disabled', 'true');
    completeBtn.classList.add('completion-acknowledged');
    // show reflective completion moment inline
    const reflect = h('div', { class: 'completion-reflection animate-in', role: 'status', 'aria-live': 'polite' }, [
      h('h3', {}, ['Complete']),
      h('p', {}, ['You took time with this. What will you carry forward?']),
      h('p', { class: 'meta' }, ['Return any time — the experience will remember your progress.'])
    ]);
    (completeBtn.parentElement || elements[elements.length-1].parentElement)?.insertBefore?.(reflect, completeBtn.nextSibling);
    // fallback append
    const container = completeBtn.closest('.complete-action') || completeBtn.parentElement;
    if (container && !container.querySelector('.completion-reflection')) {
      container.appendChild(reflect);
    }
  });
  elements.push(h('div', { class: 'complete-action' }, [completeBtn, completeHelp]));

  if (next.nextInCollection) {
    elements.push(
      h('div', { class: 'next-step animate-in' }, [
        h('h4', {}, ['Next in this collection']),
        h('a', { class: 'btn primary', href: `/experience/${next.nextInCollection.id}` }, [
          `Continue to ${next.nextInCollection.title}`
        ]),
      ])
    );
  } else if (next.related && next.related.length > 0) {
    elements.push(
      h('div', { class: 'next-step animate-in' }, [
        h('h4', {}, ['Related in this collection']),
        h('ul', {}, next.related.map((r: any) =>
          h('li', {}, [h('a', { href: `/experience/${r.id}` }, [r.title])])
        ))
      ])
    );
  } else if (returnSummary.completed) {
    elements.push(
      h('div', { class: 'completion-banner completion-reflection', role: 'status' }, [
        h('h3', {}, ['Complete']),
        h('p', {}, ['You explored this thoroughly. Take a moment — what stood out?']),
        h('p', { class: 'meta' }, [
          `Visited ${returnSummary.totalSessions} time${returnSummary.totalSessions === 1 ? '' : 's'}.`,
          ' Your progress is saved locally.'
        ]),
        h('div', { class: 'cta-row', style: 'margin-top:1rem;' }, [
          h('a', { class: 'btn subtle', href: '/library' }, ['Return to Library']),
          h('a', { class: 'btn', href: '/collections' }, ['Continue exploring'])
        ])
      ])
    );
  }

  return h('div', { class: 'container' }, elements);
}
