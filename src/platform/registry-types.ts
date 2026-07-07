import type { ExperienceCategory } from './types';

export interface ExperienceEntry {
  id: string;
  title: string;
  description: string;
  category: ExperienceCategory;
  /** Filename of the module inside `src/experiences/`. */
  module: string;
  tags?: string[];
}
