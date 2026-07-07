import { getExperienceById, getExperiencesInCollection, getCollectionById, getAllCollections, getAllExperiences } from './registry';
import { getAllProgress, getProgress, getRecentlyVisited, getFavorites, getCompletedCollections, getPreferredCategories } from './lifecycle';
import type { ExperienceEntry, CollectionEntry } from './registry-types';

export interface DiscoverySuggestion {
  experience: ExperienceEntry;
  reason: string;
  priority: number;
}

export interface FeaturedItem {
  type: 'collection' | 'experience';
  item: CollectionEntry | ExperienceEntry;
  reason: string;
}

export function getRelatedExperiences(experienceId: string, limit = 3): ExperienceEntry[] {
  const exp = getExperienceById(experienceId);
  if (!exp || !exp.collection) return [];
  return getExperiencesInCollection(exp.collection).filter(e => e.id !== experienceId).slice(0, limit);
}

export function getContinueExploringSuggestions(limit = 4): DiscoverySuggestion[] {
  const allP = getAllProgress();
  const sug: DiscoverySuggestion[] = [];

  // Recently visited but not completed
  const recent = getRecentlyVisited();
  recent.forEach(id => {
    const e = getExperienceById(id);
    if (!e) return;
    const p = getProgress(id);
    if (p && !p.completed && p.totalSessions >= 1) {
      sug.push({
        experience: e,
        reason: 'Continue where you left off',
        priority: 100
      });
    }
  });

  // Started but not completed
  Object.keys(allP).forEach(id => {
    if (recent.includes(id)) return;
    const e = getExperienceById(id);
    if (!e) return;
    const p = getProgress(id);
    if (p && !p.completed && p.totalSessions >= 1) {
      sug.push({
        experience: e,
        reason: 'You started this — come back and build on it',
        priority: 90 - (p.totalSessions || 0)
      });
    }
  });

  // Suggest next in collection
  const cols = new Set<string>();
  Object.keys(allP).forEach(id => {
    const e = getExperienceById(id);
    if (e?.collection) cols.add(e.collection);
  });
  cols.forEach(c => {
    const experiences = getExperiencesInCollection(c);
    experiences.forEach(e => {
      if (!allP[e.id]) {
        const col = getCollectionById(c);
        sug.push({
          experience: e,
          reason: `Next in ${col?.title || 'collection'}`,
          priority: 75
        });
      }
    });
  });

  // Foundations collection for new users
  getExperiencesInCollection('foundations').forEach(e => {
    if (!allP[e.id]) {
      sug.push({
        experience: e,
        reason: 'Part of the Foundations collection',
        priority: 50
      });
    }
  });

  const seen = new Set<string>();
  return sug
    .filter(s => {
      if (seen.has(s.experience.id)) return false;
      seen.add(s.experience.id);
      return true;
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

export function getRecommendations(limit = 4): DiscoverySuggestion[] {
  const allP = getAllProgress();
  const recent = getRecentlyVisited();
  const favorites = getFavorites();
  const preferredCats = getPreferredCategories();
  const completedCols = getCompletedCollections();
  const sug: DiscoverySuggestion[] = [];

  // 1. Continue where you left off (highest priority)
  recent.forEach(id => {
    const e = getExperienceById(id);
    if (!e) return;
    const p = getProgress(id);
    if (p && !p.completed && p.totalSessions >= 1) {
      sug.push({ experience: e, reason: 'Continue where you left off', priority: 100 });
    }
  });

  // 2. If you enjoyed X, try Y (same collection, same category)
  recent.forEach(id => {
    const e = getExperienceById(id);
    if (!e) return;
    const p = getProgress(id);
    if (!p || p.completed) return;

    // Same collection next
    if (e.collection) {
      const colExps = getExperiencesInCollection(e.collection);
      const idx = colExps.findIndex(x => x.id === id);
      if (idx >= 0 && idx < colExps.length - 1) {
        const next = colExps[idx + 1];
        if (!allP[next.id]) {
          sug.push({ experience: next, reason: `After ${e.title}, try ${next.title}`, priority: 85 });
        }
      }
    }

    // Same category
    const sameCat = getAllExperiences().filter(x => x.category === e.category && x.id !== e.id && !allP[x.id]);
    sameCat.slice(0, 1).forEach(x => {
      sug.push({ experience: x, reason: `If you enjoyed ${e.title}, try ${x.title}`, priority: 70 });
    });
  });

  // 3. Based on favorites
  favorites.forEach(id => {
    const fav = getExperienceById(id);
    if (!fav) return;
    const sameCat = getAllExperiences().filter(x => x.category === fav.category && x.id !== id && !allP[x.id]);
    sameCat.slice(0, 1).forEach(x => {
      sug.push({ experience: x, reason: `More like ${fav.title}`, priority: 65 });
    });
  });

  // 4. Based on preferred categories
  const topCat = Object.keys(preferredCats).sort((a, b) => preferredCats[b] - preferredCats[a])[0];
  if (topCat) {
    const catExps = getAllExperiences().filter(e => e.category === topCat && !allP[e.id]);
    catExps.slice(0, 1).forEach(e => {
      sug.push({ experience: e, reason: `Because you enjoy ${topCat} experiences`, priority: 60 });
    });
  }

  // 5. Complete the collection prompt
  getAllCollections().forEach(col => {
    if (completedCols.includes(col.id)) return;
    const exps = getExperiencesInCollection(col.id);
    const completedCount = exps.filter(e => allP[e.id]?.completed).length;
    if (completedCount > 0 && completedCount < exps.length) {
      const next = exps.find(e => !allP[e.id]?.completed);
      if (next) {
        sug.push({
          experience: next,
          reason: `Complete the ${col.title} collection (${completedCount}/${exps.length} done)`,
          priority: 55
        });
      }
    }
  });

  // 6. New experiences for returning users
  const allExps = getAllExperiences();
  const unplayed = allExps.filter(e => !allP[e.id]);
  if (unplayed.length > 0 && Object.keys(allP).length > 0) {
    unplayed.slice(0, 1).forEach(e => {
      sug.push({ experience: e, reason: 'New to explore', priority: 40 });
    });
  }

  const seen = new Set<string>();
  return sug
    .filter(s => {
      if (seen.has(s.experience.id)) return false;
      seen.add(s.experience.id);
      return true;
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

export function getFeatured(): FeaturedItem | null {
  const collections = getAllCollections();
  const completedCols = getCompletedCollections();

  // First uncompleted collection
  const uncompleted = collections.find(c => !completedCols.includes(c.id));
  if (uncompleted) {
    return { type: 'collection', item: uncompleted, reason: 'Featured Collection' };
  }

  // Fallback: first collection
  if (collections.length > 0) {
    return { type: 'collection', item: collections[0], reason: 'Featured Collection' };
  }

  return null;
}

export function getRecentlyVisitedExperiences(limit = 5): ExperienceEntry[] {
  const recent = getRecentlyVisited();
  return recent
    .map(id => getExperienceById(id))
    .filter((e): e is ExperienceEntry => e !== undefined)
    .slice(0, limit);
}

export function getInProgressExperiences(): ExperienceEntry[] {
  const allP = getAllProgress();
  return Object.keys(allP)
    .filter(id => {
      const p = allP[id];
      return p && !p.completed && p.totalSessions > 0;
    })
    .map(id => getExperienceById(id))
    .filter((e): e is ExperienceEntry => e !== undefined);
}

export function getCompletedExperiences(): ExperienceEntry[] {
  const allP = getAllProgress();
  return Object.keys(allP)
    .filter(id => allP[id]?.completed)
    .map(id => getExperienceById(id))
    .filter((e): e is ExperienceEntry => e !== undefined);
}

export function getFavoriteExperiences(): ExperienceEntry[] {
  return getFavorites()
    .map(id => getExperienceById(id))
    .filter((e): e is ExperienceEntry => e !== undefined);
}

export function getBrowseByCategory(): { category: string; count: number; experiences: ExperienceEntry[] }[] {
  const all = getAllExperiences();
  const byCat = new Map<string, ExperienceEntry[]>();
  all.forEach(e => {
    const list = byCat.get(e.category) || [];
    list.push(e);
    byCat.set(e.category, list);
  });
  return Array.from(byCat.entries())
    .map(([category, experiences]) => ({ category, count: experiences.length, experiences }))
    .sort((a, b) => b.count - a.count);
}

export function getNextSteps(experienceId: string): {
  collection?: { id: string; title: string };
  related: ExperienceEntry[];
  hasProgress: boolean;
  nextInCollection?: ExperienceEntry;
} {
  const exp = getExperienceById(experienceId);
  const collection = exp?.collection ? getCollectionById(exp.collection) : undefined;
  const related = getRelatedExperiences(experienceId);
  const hasProgress = !!getProgress(experienceId);

  let nextInCollection: ExperienceEntry | undefined;
  if (collection) {
    const experiences = getExperiencesInCollection(collection.id);
    const idx = experiences.findIndex(e => e.id === experienceId);
    if (idx >= 0 && idx < experiences.length - 1) {
      nextInCollection = experiences[idx + 1];
    }
  }

  return {
    collection: collection ? { id: collection.id, title: collection.title } : undefined,
    related,
    hasProgress,
    nextInCollection
  };
}

export function getCollectionCompletion(collectionId: string): {
  total: number;
  completed: number;
  percentage: number;
  inProgress: number;
} {
  const experiences = getExperiencesInCollection(collectionId);
  const progress = getAllProgress();
  const completed = experiences.filter(e => progress[e.id]?.completed).length;
  const inProgress = experiences.filter(e => {
    const p = progress[e.id];
    return p && !p.completed && p.totalSessions > 0;
  }).length;
  return {
    total: experiences.length,
    completed,
    percentage: experiences.length > 0 ? Math.round((completed / experiences.length) * 100) : 0,
    inProgress
  };
}

export function getSuggestedNextExperience(collectionId: string): ExperienceEntry | null {
  const experiences = getExperiencesInCollection(collectionId);
  const progress = getAllProgress();

  // First unstarted experience
  const unstarted = experiences.find(e => !progress[e.id]);
  if (unstarted) return unstarted;

  // First in-progress experience
  const inProgress = experiences.find(e => {
    const p = progress[e.id];
    return p && !p.completed && p.totalSessions > 0;
  });
  if (inProgress) return inProgress;

  // Last experience if all completed
  if (experiences.length > 0) return experiences[experiences.length - 1];

  return null;
}
