import { h, debounce } from '../platform/utils';
import { getAllCollections, getExperiencesInCollection } from '../platform/registry';
import {
  getContinueExploringSuggestions,
  getRecommendations,
  getFeatured,
  getRecentlyVisitedExperiences,
  getBrowseByCategory,
  getCollectionCompletion,
} from '../platform/discovery';
import { getProfileSummary } from '../platform/lifecycle';
import { analytics } from '../platform/analytics';
import {
  getCollectionIdentity,
  getCollectionCSSVariables,
  renderCollectionBadge,
  renderCollectionCover,
} from '../platform/collection-identity';
import { renderExperienceHero, renderLibraryHero } from '../platform/illustration-system';
import { search } from '../platform/search';

export function renderHome(): HTMLElement {
  const collections = getAllCollections();
  const profile = getProfileSummary();
  const hasProgress = profile.totalExperiencesPlayed > 0;

  const searchInput = h('input', {
    class: 'search-input home-search',
    type: 'search',
    placeholder: 'Search experiences, collections, stories…',
    'aria-label': 'Search ITTYBITTYBITES',
  });

  const searchResults = h('div', { class: 'search-results' }, []);

  const doSearch = (term: string): void => {
    searchResults.innerHTML = '';
    if (!term.trim()) {
      searchResults.style.display = 'none';
      return;
    }

    const results = search(term);
    searchResults.style.display = 'block';

    if (results.length === 0) {
      searchResults.appendChild(h('div', { class: 'empty-state', style: 'padding: var(--space-4); margin: 0;' }, [
        h('p', {}, ['No results found for “', h('strong', {}, [term]), '”.']),
        h('span', { class: 'muted', style: 'font-size: 0.85rem;' }, ['Try different keywords.']),
      ]));
      return;
    }

    const grouped = h('div', { class: 'search-results-grouped' }, []);
    results.slice(0, 8).forEach((result) => {
      const link = result.type === 'experience'
        ? `/experience/${result.id}`
        : result.type === 'collection'
          ? `/collections#${result.id}`
          : '/library';

      grouped.appendChild(h('a', { class: 'search-result-item', href: link }, [
        h('span', { class: 'search-result-type' }, [result.type]),
        h('span', { class: 'search-result-title' }, [result.title]),
        h('span', { class: 'search-result-desc' }, [result.description]),
      ]));
    });

    searchResults.appendChild(grouped);
  };

  const debouncedSearch = debounce(doSearch, 150);
  searchInput.addEventListener('input', () => debouncedSearch(searchInput.value));

  const heroActions = hasProgress
    ? (() => {
        const continueSuggestions = getContinueExploringSuggestions(2);
        const recommendations = getRecommendations(2);
        const allSuggestions = [...continueSuggestions, ...recommendations].slice(0, 3);
        if (allSuggestions.length === 0) {
          return h('div', { class: 'cta-row' }, [
            h('a', { class: 'btn primary', href: '/collections' }, ['Continue exploring']),
          ]);
        }

        return h('div', { class: 'quick-actions' }, allSuggestions.map((suggestion) =>
          h('a', { class: 'btn', href: `/experience/${suggestion.experience.id}` }, [
            suggestion.experience.title,
            h('span', { class: 'quick-reason' }, [suggestion.reason]),
          ])
        ));
      })()
    : (() => {
        const foundations = getExperiencesInCollection('foundations');
        const firstExp = foundations[0];

        const secondaryBtn = h('a', { class: 'btn subtle', href: '/experiences' }, ['Browse all experiences']);

        if (!firstExp) {
          return h('div', { class: 'cta-row' }, [
            h('a', { class: 'btn primary', href: '/collections' }, ['Begin with Foundations']),
            secondaryBtn,
          ]);
        }

        const primaryBtn = h('a', { class: 'btn primary', href: `/experience/${firstExp.id}` }, [`Begin: ${firstExp.title}`]);
        primaryBtn.addEventListener('click', () => {
          analytics.track('onboarding_begin_clicked', { target_experience: firstExp.id });
        });

        return h('div', { class: 'cta-row' }, [
          primaryBtn,
          secondaryBtn,
        ]);
      })();

  const hero = h('section', { class: 'hero hero-publication animate-in' }, [
    h('div', { class: 'hero-copy' }, [
      h('p', { class: 'eyebrow' }, [hasProgress ? 'Return to the shelf' : 'Library Season 1']),
      h('h1', {}, [hasProgress ? 'Welcome back' : 'ITTYBITTYBITES']),
      h('p', { class: 'lead' }, [hasProgress
        ? `You’ve explored ${profile.totalExperiencesPlayed} experience${profile.totalExperiencesPlayed === 1 ? '' : 's'}. Pick up the next thread.`
        : 'Interactive collections worth returning to.']),
      h('p', { class: 'hero-supporting' }, [
        'Every collection is now treated like a distinct illustrated volume: structured, paced, and visually authored.'
      ]),
      heroActions,
    ]),
    h('div', { class: 'hero-visual' }, [
      renderLibraryHero({ eager: true, decorative: true })
    ]),
  ]);

  const featured = getFeatured();
  let featuredSection: HTMLElement | null = null;
  
  if (featured) {
    if (featured.type === 'collection') {
      featuredSection = renderFeaturedCollection(featured.item as any, featured.reason);
    } else if (featured.type === 'experience') {
      featuredSection = renderFeaturedExperience(featured.item as any, featured.reason);
    }
  }

  const continueSuggestions = getContinueExploringSuggestions(3);
  const continueSection = continueSuggestions.length > 0
    ? h('section', { class: 'section' }, [
        renderSectionHeading('Continue Playing', 'Resume the ideas already in motion.'),
        h('div', { class: 'suggestion-cards' }, continueSuggestions.map((suggestion) =>
          renderExperienceCard({
            entry: suggestion.experience,
            href: `/experience/${suggestion.experience.id}`,
            reason: suggestion.reason,
            cardClass: 'suggestion-card',
          })
        )),
      ])
    : null;

  const recent = getRecentlyVisitedExperiences(4);
  const recentSection = recent.length > 0
    ? h('section', { class: 'section' }, [
        renderSectionHeading('Recently Visited', 'Return to an idea before it fades.'),
        h('div', { class: 'mini-grid' }, recent.map((entry) =>
          renderExperienceCard({
            entry,
            href: `/experience/${entry.id}`,
            cardClass: 'mini-card',
            compact: true,
          })
        )),
      ])
    : null;

  const recommendations = getRecommendations(3);
  const recommendationsSection = recommendations.length > 0
    ? h('section', { class: 'section' }, [
        renderSectionHeading('Recommended for You', 'Connections surfaced from what you’ve already explored.'),
        h('div', { class: 'suggestion-cards' }, recommendations.map((recommendation) =>
          renderExperienceCard({
            entry: recommendation.experience,
            href: `/experience/${recommendation.experience.id}`,
            reason: recommendation.reason,
            cardClass: 'suggestion-card',
          })
        )),
      ])
    : null;

  const browseCollectionsSection = h('section', { class: 'section' }, [
    renderSectionHeading('Browse by Collection', 'Eight distinct visual volumes, each with its own logic and atmosphere.'),
    h('div', { class: 'browse-grid browse-grid--collections' }, collections.map((collection) => {
      const completion = getCollectionCompletion(collection.id);
      const identity = getCollectionIdentity(collection.id);
      const badge = renderCollectionBadge(collection.id, 64, 'collection-badge-image');
      const illustration = renderCollectionCover(collection.id, { variant: 'thumbnail', className: 'collection-card-illustration' });
      const metaChildren: Array<Node | string> = [
        h('span', {}, [`${collection.experiences.length} experiences`]),
      ];

      if (completion.percentage > 0) {
        metaChildren.push(h('span', { class: 'meta' }, [`${completion.percentage}% complete`]));
      }

      const card = h('a', {
        class: 'browse-card browse-card--collection',
        href: '/collections',
        style: getCollectionCSSVariables(collection.id),
        'data-collection': collection.id,
      }, []);

      if (illustration) {
        card.appendChild(h('div', { class: 'card-figure-wrap' }, [illustration]));
      }

      const label = h('div', { class: 'collection-card-label' }, []);
      if (badge) label.appendChild(badge);
      label.appendChild(h('div', { class: 'collection-card-heading' }, [
        h('h3', {}, [identity?.title || collection.title]),
        h('p', { class: 'meta collection-direction' }, [identity?.direction || collection.summary || '']),
      ]));

      card.append(label);
      card.appendChild(h('p', {}, [collection.description]));
      card.appendChild(h('div', { class: 'browse-meta' }, metaChildren));
      return card;
    })),
  ]);

  const categories = getBrowseByCategory();
  const browseThemesSection = h('section', { class: 'section' }, [
    renderSectionHeading('Browse by Theme', 'Themes cut across collections and help new pathways appear.'),
    h('div', { class: 'browse-grid' }, categories.map((category) =>
      h('a', { class: 'browse-card theme-card', href: `/experiences?category=${encodeURIComponent(category.category)}` }, [
        h('h3', {}, [category.category]),
        h('p', {}, [`${category.count} experience${category.count === 1 ? '' : 's'}`]),
        h('div', { class: 'theme-tags' }, category.experiences.slice(0, 3).map((entry) =>
          h('span', { class: 'tag' }, [entry.title])
        )),
      ])
    )),
  ]);

  const searchContainer = h('section', { class: 'section' }, [
    renderSectionHeading('Search the Library', 'Find experiences, motifs, or concepts.'),
    h('div', { class: 'search-wrapper', style: 'width: 100%; max-width: 48rem;' }, [searchInput, searchResults]),
  ]);

  const children: HTMLElement[] = [hero];
  if (featuredSection) children.push(featuredSection);
  if (continueSection) children.push(continueSection);
  if (recentSection) children.push(recentSection);
  if (recommendationsSection) children.push(recommendationsSection);
  children.push(searchContainer, browseCollectionsSection, browseThemesSection);

  return h('div', { class: 'container' }, children);
}

function renderFeaturedExperience(experience: any, reason: string): HTMLElement {
  const collectionId = experience.collection;
  const heroArtwork = renderExperienceHero(experience.id, { variant: 'hero', className: 'featured-experience-hero', decorative: true, eager: true });
  
  const section = h('section', {
    class: 'section featured-section publication-panel',
    style: collectionId ? getCollectionCSSVariables(collectionId) : '',
    'data-collection': collectionId || '',
  }, [
    h('div', { class: 'featured-copy' }, [
      h('div', { class: 'featured-badge' }, [reason]),
      h('h2', {}, [experience.title]),
      h('p', { class: 'meta collection-direction' }, [
        experience.category, 
        ' • ', 
        `⏱ ${experience.estimatedDuration || '2 min'}`
      ]),
      h('p', { class: 'lead' }, [experience.summary || experience.description]),
      h('div', { class: 'cta-row', style: 'margin-top: auto;' }, [
        h('a', { class: 'btn primary', href: `/experience/${experience.id}` }, ['Begin Experience']),
      ]),
    ]),
  ]);

  if (heroArtwork) {
    const artWrap = h('div', { class: 'featured-artwork featured-artwork--experience' }, [
      heroArtwork,
      // Overlay a subtle play indicator to make it look interactive
      h('div', { class: 'play-overlay' }, [
        h('span', { class: 'play-icon', 'aria-hidden': 'true' }, ['▶'])
      ])
    ]);
    
    const imageLink = h('a', { href: `/experience/${experience.id}`, tabIndex: -1, class: 'featured-art-link' }, [artWrap]);
    section.appendChild(imageLink);
  }

  return section;
}

function renderFeaturedCollection(collection: any, reason: string): HTMLElement {
  const collectionId = collection.id;
  const identity = getCollectionIdentity(collectionId);
  const illustration = renderCollectionCover(collectionId, { variant: 'cover', className: 'featured-illustration' });
  const badge = renderCollectionBadge(collectionId, 72, 'featured-badge-image');

  const section = h('section', {
    class: 'section featured-section publication-panel',
    style: getCollectionCSSVariables(collectionId),
    'data-collection': collectionId,
  }, [
    h('div', { class: 'featured-copy' }, [
      h('div', { class: 'featured-badge' }, [reason]),
      h('div', { class: 'featured-title-row' }, [
        ...(badge ? [badge] : []),
        h('div', {}, [
          h('h2', {}, [identity?.title || collection.title || 'Featured collection']),
          h('p', { class: 'meta collection-direction' }, [identity?.direction || '']),
        ]),
      ]),
      h('p', {}, [collection.description || identity?.direction || 'A collection worth revisiting.']),
      h('div', { class: 'cta-row' }, [
        h('a', { class: 'btn primary', href: '/collections' }, ['Explore Collection']),
      ]),
    ]),
  ]);

  if (illustration) {
    section.appendChild(h('div', { class: 'featured-artwork' }, [illustration]));
  }

  return section;
}

function renderSectionHeading(title: string, description: string): HTMLElement {
  return h('div', { class: 'section-heading' }, [
    h('h2', {}, [title]),
    h('p', { class: 'section-intro' }, [description]),
  ]);
}

function renderExperienceCard({
  entry,
  href,
  reason,
  cardClass,
  compact = false,
}: {
  entry: any;
  href: string;
  reason?: string;
  cardClass: string;
  compact?: boolean;
}): HTMLElement {
  const artwork = renderExperienceHero(entry.id, {
    variant: 'thumbnail',
    className: compact ? 'experience-thumb experience-thumb--compact' : 'experience-thumb',
    decorative: true,
  });

  const collectionId = entry.collection;
  const card = h('a', {
    class: cardClass,
    href,
    style: collectionId ? getCollectionCSSVariables(collectionId) : undefined,
    'data-collection': collectionId,
  }, []);

  if (artwork) {
    card.appendChild(h('div', { class: 'experience-thumb-wrap' }, [artwork]));
  }

  const duration = entry.estimatedDuration || '2 min';
  const categoryMeta = h('span', {}, [entry.category]);
  const durationMeta = h('span', { class: 'meta-duration' }, [`⏱ ${duration}`]);
  const metaWrapper = h('p', { class: 'meta experience-meta-row' }, [categoryMeta, ' • ', durationMeta]);

  const titleElement = compact ? h('strong', {}, [entry.title]) : h('h3', {}, [entry.title]);
  const content = h('div', { class: compact ? 'experience-card-content experience-card-content--compact' : 'experience-card-content' }, [
    metaWrapper,
    titleElement,
    h('p', {}, [entry.summary || entry.description]),
  ]);

  if (reason) {
    content.appendChild(h('span', { class: 'suggestion-reason' }, [reason]));
  }

  card.appendChild(content);
  return card;
}
