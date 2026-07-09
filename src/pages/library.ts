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
import { getCollectionCSSVariables, renderCollectionBadge } from '../platform/collection-identity';
import { renderBookmarkIcon, renderExperienceHero } from '../platform/illustration-system';

export function renderLibrary(): HTMLElement {
  const profile = getProfileSummary();
  const allProgress = getAllProgress();
  const hasProgress = Object.keys(allProgress).length > 0;

  const statsGrid = h('div', { class: 'stats-grid' }, [
    renderStatCard(String(profile.totalExperiencesPlayed), 'Experiences Played'),
    renderStatCard(String(profile.totalCompleted), 'Completed'),
    renderStatCard(String(profile.totalCollectionsCompleted), 'Collections Done'),
    renderStatCard(String(profile.currentStreak), 'Day Streak'),
    renderStatCard(String(profile.totalVisits), 'Total Visits'),
    renderStatCard(profile.topCategory || '—', 'Top Category'),
  ]);

  const recent = getRecentlyVisitedExperiences(6);
  const recentSection = recent.length > 0
    ? h('section', { class: 'library-section' }, [
        renderSectionHeading('Recently Visited', 'Ideas you’ve already touched and can now revisit with new context.'),
        h('div', { class: 'mini-grid' }, recent.map((entry) => renderMiniCard(entry))),
      ])
    : null;

  const inProgress = getInProgressExperiences();
  const inProgressSection = inProgress.length > 0
    ? h('section', { class: 'library-section' }, [
        renderSectionHeading('In Progress', 'Threads that are still open.'),
        h('div', { class: 'mini-grid' }, inProgress.map((entry) => renderMiniCard(entry, true))),
      ])
    : null;

  const completed = getCompletedExperiences();
  const completedSection = completed.length > 0
    ? h('section', { class: 'library-section' }, [
        renderSectionHeading('Completed', 'Finished, but never exhausted.'),
        h('div', { class: 'mini-grid' }, completed.map((entry) => renderMiniCard(entry))),
      ])
    : null;

  const favorites = getFavoriteExperiences();
  const favoritesSection = favorites.length > 0
    ? h('section', { class: 'library-section' }, [
        renderSectionHeading('Saved', 'Marked to return to later.'),
        h('div', { class: 'mini-grid' }, favorites.map((entry) => renderMiniCard(entry))),
      ])
    : null;

  const collections = getAllCollections();
  const collectionProgressSection = collections.length > 0
    ? h('section', { class: 'library-section' }, [
        renderSectionHeading('Collection Progress', 'Your shelf-wide progress at a glance.'),
        h('div', { class: 'collection-progress-list' }, collections.map((collection) => {
          const completion = getCollectionCompletion(collection.id);
          const badge = renderCollectionBadge(collection.id, 52, 'collection-badge-image');
          const item = h('div', {
            class: 'collection-progress-item',
            style: getCollectionCSSVariables(collection.id),
            'data-collection': collection.id,
          }, []);

          if (badge) {
            item.appendChild(badge);
          }

          item.appendChild(h('div', { class: 'collection-progress-info' }, [
            h('strong', {}, [collection.title]),
            h('span', { class: 'meta' }, [`${completion.completed}/${completion.total} completed`]),
          ]));
          item.appendChild(h('div', { class: 'progress-track' }, [
            h('div', {
              class: 'progress-fill',
              style: `width:${completion.percentage}%`,
              'aria-hidden': 'true',
            }),
          ]));
          if (completion.percentage === 100) {
            item.appendChild(h('span', { class: 'badge completed' }, ['Done']));
          }

          return item;
        })),
      ])
    : null;

  const emptyState = !hasProgress
    ? h('div', { class: 'empty-state library-empty publication-panel' }, [
        h('h3', {}, ['Your journey is just beginning']),
        h('p', {}, ['Explore experiences and your progress will appear here as a living shelf of returns, completions, and saved ideas.']),
        h('div', { class: 'hero-shelf hero-shelf--compact' }, collections.slice(0, 4).map((collection) => {
          const badge = renderCollectionBadge(collection.id, 72, 'hero-shelf-badge');
          const card = h('a', {
            class: 'hero-shelf-card',
            href: '/collections',
            style: getCollectionCSSVariables(collection.id),
            'data-collection': collection.id,
          }, []);
          if (badge) card.appendChild(badge);
          card.appendChild(h('strong', {}, [collection.title]));
          return card;
        })),
        h('a', { class: 'btn primary', href: '/collections' }, ['Start Exploring']),
      ])
    : null;

  const resetSection = hasProgress
    ? h('section', { class: 'library-section reset-section' }, [
        renderSectionHeading('Data', 'Your progress is stored locally in this browser.'),
        h('button', { class: 'btn subtle', type: 'button' }, ['Reset All Progress']),
      ])
    : null;

  if (resetSection) {
    const resetButton = resetSection.querySelector('button');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        if (confirm('Reset all local progress? This cannot be undone.')) {
          resetAllProgress();
          window.location.reload();
        }
      });
    }
  }

  const children: HTMLElement[] = [
    h('section', { class: 'hero hero-subpage' }, [
      h('div', { class: 'hero-copy' }, [
        h('p', { class: 'eyebrow' }, ['Personal shelf']),
        h('h1', {}, ['My Library']),
        h('p', { class: 'lead' }, ['Your personal journey through the platform.']),
        h('p', { class: 'hero-supporting' }, ['This view now shares the same illustration language as the collections themselves, so your progress feels shelved and curated rather than merely tracked.']),
      ]),
    ]),
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

function renderStatCard(value: string, label: string): HTMLElement {
  return h('div', { class: 'stat-card publication-panel' }, [
    h('div', { class: 'stat-value' }, [value]),
    h('div', { class: 'stat-label' }, [label]),
  ]);
}

function renderSectionHeading(title: string, description: string): HTMLElement {
  return h('div', { class: 'section-heading' }, [
    h('h2', {}, [title]),
    h('p', { class: 'section-intro' }, [description]),
  ]);
}

function renderMiniCard(entry: any, showFavorite = false): HTMLElement {
  const allProgress = getAllProgress();
  const progress = allProgress[entry.id];
  const isFavorite = progress?.isFavorite ?? false;
  const artwork = renderExperienceHero(entry.id, {
    variant: 'thumbnail',
    className: 'experience-thumb experience-thumb--compact',
    decorative: true,
  });

  const card = h('a', {
    class: 'mini-card',
    href: `/experience/${entry.id}`,
    style: entry.collection ? getCollectionCSSVariables(entry.collection) : undefined,
    'data-collection': entry.collection,
  }, []);

  if (artwork) {
    card.appendChild(h('div', { class: 'experience-thumb-wrap' }, [artwork]));
  }

  card.appendChild(h('strong', {}, [entry.title]));
  card.appendChild(h('p', {}, [entry.summary || entry.description]));

  const meta = h('div', { class: 'mini-card-meta' }, [
    h('span', { class: 'meta' }, [entry.category]),
  ]);

  if (showFavorite) {
    meta.appendChild(renderFavoriteButton(entry.id, isFavorite));
  }

  card.appendChild(meta);
  return card;
}

function renderFavoriteButton(experienceId: string, isFavorite: boolean): HTMLElement {
  const button = h('button', {
    class: `favorite-btn${isFavorite ? ' is-favorite' : ''}`,
    type: 'button',
    'aria-label': isFavorite ? 'Remove from saved items' : 'Save for later',
    'aria-pressed': String(isFavorite),
  }, []);

  button.appendChild(renderBookmarkIcon('bookmark-icon'));

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nowFavorite = toggleFavorite(experienceId);
    button.setAttribute('aria-pressed', String(nowFavorite));
    button.setAttribute('aria-label', nowFavorite ? 'Remove from saved items' : 'Save for later');
    button.classList.toggle('is-favorite', nowFavorite);
  });

  return button;
}
