import type { ExperienceCategory } from './types';

export interface ExperienceEntry {
  id: string;
  title: string;
  description: string;
  summary?: string;
  category: ExperienceCategory;
  /** Filename of the module inside `src/experiences/`. */
  module: string;
  tags?: string[];
  searchKeywords?: string[];
  estimatedDuration?: string;
  returnValue?: string;
  /** Optional: which collection this experience belongs to (per Blueprint) */
  collection?: string;
  /** Optional: which story this experience participates in */
  story?: string;
  version?: string;
  accessibility?: {
    keyboard: boolean;
    screenReader: boolean;
    contrast: boolean;
  };
}

export interface CollectionEntry {
  id: string;
  title: string;
  description: string;
  summary?: string;
  experiences: string[]; // experience IDs
  tags?: string[];
  searchKeywords?: string[];
  estimatedDuration?: string;
  story?: string;
  version?: string;
}

export interface StorySegment {
  id: string;
  title: string;
  text: string;
  trigger: string;
}

export interface StoryEntry {
  id: string;
  title: string;
  description: string;
  summary?: string;
  relatedCollections?: string[];
  relatedExperiences?: string[];
  narrative?: string;
  segments?: StorySegment[];
  version?: string;
}
