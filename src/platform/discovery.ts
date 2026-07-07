import { getExperienceById, getExperiencesInCollection, getCollectionById } from './registry';
import { getAllProgress, getProgress, getRecentlyVisited } from './lifecycle';
import type { ExperienceEntry } from './registry-types';

export interface DiscoverySuggestion {
  experience: ExperienceEntry;
  reason: string;
  priority: number;
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
