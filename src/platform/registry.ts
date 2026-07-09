/**
 * Experience Registry (Build-time generated)
 *
 * Source of truth: src/content/{experiences,collections,stories}/*.json
 * Generated at build time into src/generated/registry.json
 */

import generated from '../generated/registry.json' assert { type: 'json' };

import type { ExperienceEntry, CollectionEntry, StoryEntry } from './registry-types';
import type { ExperienceModule } from './types';

const data = generated as {
  experiences: ExperienceEntry[];
  collections: CollectionEntry[];
  stories: StoryEntry[];
};

const experiences = data.experiences || [];
const collections = data.collections || [];
const stories = data.stories || [];

// Vite collects experience modules for dynamic loading
const modules = import.meta.glob<ExperienceModule>('../experiences/*.ts');

export { experiences, collections, stories };

export function getAllExperiences(): ExperienceEntry[] { return experiences; }
export function getExperienceById(id: string) { return experiences.find(e => e.id === id); }
export function getExperiencesByCategory(cat: string) { return experiences.filter(e => e.category === cat); }

export function getAllCollections(): CollectionEntry[] { return collections; }
export function getCollectionById(id: string) { return collections.find(c => c.id === id); }
export function getExperiencesInCollection(colId: string) {
  const col = getCollectionById(colId);
  if (!col) return [];
  return col.experiences.map(id => getExperienceById(id)).filter(Boolean) as ExperienceEntry[];
}

export function getAllStories(): StoryEntry[] { return stories; }
export function getStoryById(id: string) { return stories.find(s => s.id === id); }

export async function loadExperience(entry: ExperienceEntry): Promise<ExperienceModule> {
  const modulePath = `../experiences/${entry.module}`;
  const loader = modules[modulePath];
  if (!loader) throw new Error(`Module not found: ${modulePath}`);
  const mod = await loader();
  const actual = (mod as any).default || mod;
  if (typeof actual.mount !== 'function') throw new Error(`Invalid module: ${modulePath}`);
  return actual;
}
