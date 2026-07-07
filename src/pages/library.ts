import { getAllCollections } from '../platform/registry';
import {
  getAllProgress,
  getProfileSummary,
  toggleFavorite,
  resetAllProgress,
} from '../platform/lifecycle';
import {
  getCollectionCompletion,
  getInProgressExperiences,
  getCompletedExperiences,
  getFavoriteExperiences,
  getRecentlyVisitedExperiences,
} from '../platform/discovery';
import { h } from '../platform/utils';

export function renderLibrary(): HTMLElement {
  const profile = getProfileSummary();
  const allProgress = getAllProgress();
  const hasProgress = Object.keys(allProgress).length > 0;

  // Stats header
  const statsGrid = h('div', { class: 'stats-grid' }, [
    h('div', { class: 'stat-card' }, [
      h('div', { class: 'stat-value' }, [String(profile.totalExperiencesPlayed)]),
      h('div', { class: 'stat-label' }, ['Experiences Played']),
    ]),
    h('div', { class: 'stat-card' }, [
      h('div', { class: 'stat-value' }, [String(profile.totalCompleted)]),
      h('div', { class: 'stat-label' }, ['Completed']),
    ]),
    h('div', { class: 'stat-card' }, [
      h('div', { class: 'stat-value' }, [String(profile.totalCollectionsCompleted)]),
      h('div', { class: 'stat-label' }, ['Collections Done']),
    ]),
    h('div', { class: 'stat-card' }, [
      h('div', { class: 'stat-value' }, [String(profile.currentStreak)]),
      h('div', { class: 'stat-label' }, ['Day Streak']),
    ]),
    h('div', { class: 'stat-card' }, [
      h('div', { class: 'stat-value' }, [String(profile.totalVisits)]),
      h('div', { class: 'stat-label' }, ['Total Visits']),
    ]),
    h('div', { class: 'stat-card' }, [
      h('div', { class: 'stat-value' }, [profile.topCategory || '—']),
      h('div', { class: 'stat-label' }, ['Top Category']),
    ]),
  ]);

  // Recently Visited
  const recent = getRecentlyVisitedExperiences(6);
  const recentSection = recent.length > 0
    ? h('section', { class: 'library-section' }, [
        h('h2', {}, ['Recently Visited']),
        h('div', { class: 'mini-grid' }, recent.map(e => renderMiniCard(e))),
      ])
    : null;

  // In Progress
  const inProgress = getInProgressExperiences();
  const inProgressSection = inProgress.length > 0
    ? h('section', { class: 'library-section' }, [
        h('h2', {}, ['In Progress']),
        h('div', { class: 'mini-grid' }, inProgress.map(e => renderMiniCard(e, true))),
      ])
    : null;

  // Completed
  const completed = getCompletedExperiences();
  const completedSection = completed.length > 0
    ? h('section', { class: 'library-section' }, [
        h('h2', {}, ['Completed']),
        h('div', { class: 'mini-grid' }, completed.map(e => renderMiniCard(e))),
      ])
    : null;

  // Favorites
  const favorites = getFavoriteExperiences();
  const favoritesSection = favorites.length > 0
    ? h('section', { class: 'library-section' }, [
        h('h2', {}, ['Favorites']),
        h('div', { class: 'mini-grid' }, favorites.map(e => renderMiniCard(e))),
      ])
    : null;

  // Collection Progress
  const collections = getAllCollections();
  const collectionProgressSection = collections.length > 0
    ? h('section', { class: 'library-section' }, [
        h('h2', {}, ['Collection Progress']),
        h('div', { class: 'collection-progress-list' }, collections.map(col => {
          const completion = getCollectionCompletion(col.id);
          const isCompleted = completion.percentage === 100;
          const children: (string | Node)[] = [
            h('div', { class: 'collection-progress-info' }, [
              h('strong', {}, [col.title]),
              h('span', { class: 'meta' }, [`${completion.completed}/${completion.total} completed`]),
            ]),
            h('div', { class: 'progress-track' }, [
              h('div', {
                class: 'progress-fill',
                style: `width:${completion.percentage}%`,
                'aria-hidden': 'true'
              }),
            ]),
          ];
          if (isCompleted) {
            children.push(h('span', { class: 'badge completed' }, ['Done']));
          }
          return h('div', { class: 'collection-progress-item' }, children);
        })),
      ])
    : null;

  // Empty state
  const emptyState = !hasProgress
    ? h('div', { class: 'empty-state library-empty' }, [
        h('h3', {}, ['Your journey is just beginning']),
        h('p', {}, ['Explore experiences and your progress will appear here.']),
        h('a', { class: 'btn', href: '/collections' }, ['Start Exploring']),
      ])
    : null;

  // Reset action
  const resetSection = hasProgress
    ? h('section', { class: 'library-section reset-section' }, [
        h('h2', {}, ['Data']),
        h('p', { class: 'muted' }, ['Your progress is stored locally in this browser.']),
        h('button', { class: 'btn subtle', type: 'button' }, ['Reset All Progress']),
      ])
    : null;

  if (resetSection) {
    const resetBtn = resetSection.querySelector('button');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all local progress? This cannot be undone.')) {
          resetAllProgress();
          window.location.reload();
        }
      });
    }
  }

  const children: HTMLElement[] = [
    h('h1', {}, ['My Library']),
    h('p', { class: 'lead' }, ['Your personal journey through the platform.']),
  ];

  if (hasProgress) {
    children.push(statsGrid);
  }

  if (emptyState) children.push(emptyState);
  if (recentSection) children.push(recentSection);
  if (inProgressSection) children.push(inProgressSection);
  if (favoritesSection) children.push(favoritesSection);
  if (completedSection) children.push(completedSection);
  if (collectionProgressSection) children.push(collectionProgressSection);
  if (resetSection) children.push(resetSection);

  return h('div', { class: 'container' }, children);
}

function renderMiniCard(entry: any, showFavorite = false): HTMLElement {
  const allP = getAllProgress();
  const prog = allP[entry.id];
  const isFav = prog?.isFavorite ?? false;

  const metaChildren: (string | Node)[] = [
    h('span', { class: 'meta' }, [entry.category]),
  ];
  if (showFavorite) {
    metaChildren.push(renderFavoriteButton(entry.id, isFav));
  }

  const card = h('article', { class: 'mini-card' }, [
    h('a', { href: `/experience/${entry.id}` }, [entry.title]),
    h('p', {}, [entry.summary || entry.description]),
    h('div', { class: 'mini-card-meta' }, metaChildren),
  ]);

  return card;
}

function renderFavoriteButton(experienceId: string, isFav: boolean): HTMLElement {
  const btn = h('button', {
    class: 'favorite-btn',
    type: 'button',
    'aria-label': isFav ? 'Remove from favorites' : 'Add to favorites',
    'aria-pressed': String(isFav),
  }, [isFav ? '★' : '☆']);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowFav = toggleFavorite(experienceId);
    btn.textContent = nowFav ? '★' : '☆';
    btn.setAttribute('aria-pressed', String(nowFav));
    btn.setAttribute('aria-label', nowFav ? 'Remove from favorites' : 'Add to favorites');
  });

  return btn;
}
