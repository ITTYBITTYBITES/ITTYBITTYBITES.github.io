/**
 * Experience registry.
 *
 * `src/content/experiences.json` is the source of truth for available experiences.
 * Modules live in `src/experiences/` and are lazy-loaded on demand.
 */

import rawExperiences from '../content/experiences.json';
import type { ExperienceEntry } from './registry-types';
import type { ExperienceModule } from './types';

const experiences = rawExperiences as ExperienceEntry[];

// Vite collects all experience modules so they are bundled and available for dynamic import.
const modules = import.meta.glob<ExperienceModule>('../experiences/*.ts');

export { experiences };

export function getAllExperiences(): ExperienceEntry[] {
  return experiences;
}

export function getExperienceById(id: string): ExperienceEntry | undefined {
  return experiences.find((entry) => entry.id === id);
}

export function getExperiencesByCategory(category: string): ExperienceEntry[] {
  return experiences.filter((entry) => entry.category === category);
}

export async function loadExperience(entry: ExperienceEntry): Promise<ExperienceModule> {
  const modulePath = `../experiences/${entry.module}`;
  const loader = modules[modulePath];
  if (!loader) {
    throw new Error(`Experience module not found: ${modulePath}`);
  }
  const mod = await loader();
  if (typeof mod.mount !== 'function') {
    throw new Error(`Experience module must export a mount function: ${modulePath}`);
  }
  return mod;
}
