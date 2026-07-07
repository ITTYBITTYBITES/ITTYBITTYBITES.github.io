/**
 * Experience registry.
 *
 * `src/content/experiences.json` is the source of truth for available experiences.
 * Modules live in `src/experiences/` and are lazy-loaded on demand.
 *
 * Per PLATFORM_BLUEPRINT v1.0.0:
 * Experiences create Collections. Collections create Discovery.
 */

import rawExperiences from '../content/experiences.json';
import rawCollections from '../content/collections.json';
import rawStories from '../content/stories.json';

import type { ExperienceEntry, CollectionEntry, StoryEntry } from './registry-types';
import type { ExperienceModule } from './types';

const experiences = rawExperiences as ExperienceEntry[];
const collections = rawCollections as CollectionEntry[];
const stories = rawStories as StoryEntry[];

// Vite collects all experience modules so they are bundled and available for dynamic import.
const modules = import.meta.glob<ExperienceModule>('../experiences/*.ts');

export { experiences, collections, stories };

export function getAllExperiences(): ExperienceEntry[] {
  return experiences;
}

export function getExperienceById(id: string): ExperienceEntry | undefined {
  return experiences.find((entry) => entry.id === id);
}

export function getExperiencesByCategory(category: string): ExperienceEntry[] {
  return experiences.filter((entry) => entry.category === category);
}

export function getAllCollections(): CollectionEntry[] {
  return collections;
}

export function getCollectionById(id: string): CollectionEntry | undefined {
  return collections.find((c) => c.id === id);
}

export function getExperiencesInCollection(collectionId: string): ExperienceEntry[] {
  const collection = getCollectionById(collectionId);
  if (!collection) return [];
  return collection.experiences
    .map(id => getExperienceById(id))
    .filter((e): e is ExperienceEntry => !!e);
}

export function getAllStories(): StoryEntry[] {
  return stories;
}

export function getStoryById(id: string): StoryEntry | undefined {
  return stories.find((s) => s.id === id);
}

export async function loadExperience(entry: ExperienceEntry): Promise<ExperienceModule> {
  const modulePath = `../experiences/${entry.module}`;
  const loader = modules[modulePath];
  if (!loader) {
    throw new Error(`Experience module not found: ${modulePath}`);
  }
  const imported = await loader();
  // Handle both named export and default export patterns
  const mod = (imported as any).default || imported;
  if (typeof mod.mount !== 'function') {
    throw new Error(`Experience module must export a mount function: ${modulePath}`);
  }
  return mod;
}
