import type { ExperienceCategory } from './types';

export interface ExperienceEntry {
  id: string;
  title: string;
  description: string;
  category: ExperienceCategory;
  /** Filename of the module inside `src/experiences/`. */
  module: string;
  tags?: string[];
  /** Optional: which collection this experience belongs to (per Blueprint) */
  collection?: string;
  /** Optional: which story this experience participates in */
  story?: string;
}

export interface CollectionEntry {
  id: string;
  title: string;
  description: string;
  experiences: string[]; // experience IDs
  tags?: string[];
}

export interface StoryEntry {
  id: string;
  title: string;
  description: string;
  relatedCollections?: string[];
  relatedExperiences?: string[];
  narrative?: string;
}
