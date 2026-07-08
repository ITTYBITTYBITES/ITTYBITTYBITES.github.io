import { h } from '../platform/utils';
import { getAllCollections } from '../platform/registry';
import {
  getContinueExploringSuggestions,
  getRecommendations,
  getFeatured,
  getRecentlyVisitedExperiences,
  getBrowseByCategory,
  getCollectionCompletion,
} from '../platform/discovery';
import { getProfileSummary } from '../platform/lifecycle';
import { search } from '../platform/search';
import { debounce } from '../platform/utils';

export function renderHome(): HTMLElement {
  const collections = getAllCollections();
  const profile = getProfileSummary();
  const hasProgress = profile.totalExperiencesPlayed > 0;

  // Search
  const searchInput = h('input', {
    class: 'search-input home-search',
    type: 'search',
    placeholder: 'Search experiences, collections, stories…',
    'aria-label': 'Search ITTYBITTYBITES',
  });

  const searchResults = h('div', { class: 'search-results' }, []);

  const doSearch = (term: string) => {
    searchResults.innerHTML = '';
    if (!term.trim()) {
      searchResults.style.display = 'none';
      return;
    }
    const results = search(term);
    searchResults.style.display = 'block';

    if (results.length === 0) {
      searchResults.appendChild(h('p', { class: 'muted' }, ['No results found.']));
      return;
    }

    const grouped = h('div', { class: 'search-results-grouped' }, []);
    results.slice(0, 8).forEach(r => {
      const link = r.type === 'experience'
        ? `/experience/${r.id}`
        : r.type === 'collection'
          ? '/collections'
          : '#';
      const resultItem = h('a', { class: 'search-result-item', href: link }, [
        h('span', { class: 'search-result-type' }, [r.type]),
        h('span', { class: 'search-result-title' }, [r.title]),
        h('span', { class: 'search-result-desc' }, [r.description]),
      ]);
      grouped.appendChild(resultItem);
    });
    searchResults.appendChild(grouped);
  };

  const debouncedSearch = debounce(doSearch, 150);
  searchInput.addEventListener('input', () => debouncedSearch(searchInput.value));

  // Welcome / Continue
  let hero: HTMLElement;
  if (hasProgress) {
    const continueSuggestions = getContinueExploringSuggestions(2);
    const recommendations = getRecommendations(2);
    const allSuggestions = [...continueSuggestions, ...recommendations].slice(0, 3);

    hero = h('section', { class: 'hero discovery-hero' }, [
      h('h1', {}, ['Welcome back']),
      h('p', { class: 'lead' }, [`You've explored ${profile.totalExperiencesPlayed} experience${profile.totalExperiencesPlayed === 1 ? '' : 's'}. Keep going.`]),
      h('div', { class: 'search-wrapper' }, [searchInput, searchResults]),
      allSuggestions.length > 0
        ? h('div', { class: 'quick-actions' }, allSuggestions.map(s =>
            h('a', { class: 'btn', href: `/experience/${s.experience.id}` }, [
              s.experience.title,
              h('span', { class: 'quick-reason' }, [s.reason]),
            ])
          ))
        : h('div', { class: 'cta-row' }, [
            h('a', { class: 'btn', href: '/collections' }, ['Explore Foundations']),
          ]),
    ]);
  } else {
    hero = h('section', { class: 'hero' }, [
      h('h1', {}, ['ITTYBITTYBITES']),
      h('p', { class: 'lead' }, ['Interactive collections worth returning to.']),
      h('p', {}, [
        'Small, meaningful interactions create lasting experiences. ',
        'Explore collections across science, nature, history, and more.'
      ]),
      h('div', { class: 'search-wrapper' }, [searchInput, searchResults]),
      h('div', { class: 'cta-row' }, [
        h('a', { class: 'btn', href: '/collections' }, ['Begin with Foundations']),
        h('a', { class: 'btn subtle', href: '/experiences' }, ['Browse all experiences']),
      ]),
    ]);
  }

  // Featured Collection
  const featured = getFeatured();
  const featuredSection = featured && featured.type === 'collection'
    ? h('section', { class: 'section featured-section' }, [
        h('div', { class: 'featured-badge' }, [featured.reason]),
        h('h2', {}, [(featured.item as any).title]),
        h('p', {}, [(featured.item as any).description]),
        h('a', { class: 'btn', href: '/collections' }, ['Explore Collection']),
      ])
    : null;

  // Continue Playing
  const continueSuggestions = getContinueExploringSuggestions(3);
  const continueSection = continueSuggestions.length > 0
    ? h('section', { class: 'section' }, [
        h('h2', {}, ['Continue Playing']),
        h('div', { class: 'suggestion-cards' }, continueSuggestions.map(s =>
          h('a', { class: 'suggestion-card', href: `/experience/${s.experience.id}` }, [
            h('h3', {}, [s.experience.title]),
            h('p', {}, [s.experience.summary || s.experience.description]),
            h('span', { class: 'suggestion-reason' }, [s.reason]),
          ])
        )),
      ])
    : null;

  // Recently Visited
  const recent = getRecentlyVisitedExperiences(4);
  const recentSection = recent.length > 0
    ? h('section', { class: 'section' }, [
        h('h2', {}, ['Recently Visited']),
        h('div', { class: 'mini-grid' }, recent.map(e =>
          h('a', { class: 'mini-card', href: `/experience/${e.id}` }, [
            h('strong', {}, [e.title]),
            h('p', {}, [e.summary || e.description]),
            h('span', { class: 'meta' }, [e.category]),
          ])
        )),
      ])
    : null;

  // Recommendations
  const recommendations = getRecommendations(3);
  const recommendationsSection = recommendations.length > 0
    ? h('section', { class: 'section' }, [
        h('h2', {}, ['Recommended for You']),
        h('div', { class: 'suggestion-cards' }, recommendations.map(r =>
          h('a', { class: 'suggestion-card', href: `/experience/${r.experience.id}` }, [
            h('h3', {}, [r.experience.title]),
            h('p', {}, [r.experience.summary || r.experience.description]),
            h('span', { class: 'suggestion-reason' }, [r.reason]),
          ])
        )),
      ])
    : null;

  // Browse by Collection
  const collectionCards = collections.map(c => {
    const completion = getCollectionCompletion(c.id);
    const metaChildren: (string | Node)[] = [
      h('span', {}, [`${c.experiences.length} experiences`]),
    ];
    if (completion.percentage > 0) {
      metaChildren.push(h('span', { class: 'meta' }, [`${completion.percentage}% complete`]));
    }
    return h('a', { class: 'browse-card', href: '/collections' }, [
      h('h3', {}, [c.title]),
      h('p', {}, [c.description]),
      h('div', { class: 'browse-meta' }, metaChildren),
    ]);
  });

  const browseCollectionsSection = h('section', { class: 'section' }, [
    h('h2', {}, ['Browse by Collection']),
    h('div', { class: 'browse-grid' }, collectionCards),
  ]);

  // Browse by Theme/Category
  const categories = getBrowseByCategory();
  const categoryCards = categories.map(cat =>
    h('a', { class: 'browse-card theme-card', href: '/experiences' }, [
      h('h3', {}, [cat.category]),
      h('p', {}, [`${cat.count} experience${cat.count === 1 ? '' : 's'}`]),
      h('div', { class: 'theme-tags' }, cat.experiences.slice(0, 3).map(e =>
        h('span', { class: 'tag' }, [e.title])
      )),
    ])
  );

  const browseThemesSection = h('section', { class: 'section' }, [
    h('h2', {}, ['Browse by Theme']),
    h('div', { class: 'browse-grid' }, categoryCards),
  ]);

  const children: HTMLElement[] = [hero];
  if (featuredSection) children.push(featuredSection);
  if (continueSection) children.push(continueSection);
  if (recentSection) children.push(recentSection);
  if (recommendationsSection) children.push(recommendationsSection);
  children.push(browseCollectionsSection, browseThemesSection);

  return h('div', { class: 'container' }, children);
}
