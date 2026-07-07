/**
 * Core types shared across the platform shell and experiences.
 */

export type ExperienceCategory =
  | 'game'
  | 'application'
  | 'interactive'
  | 'utility'
  | 'experiment'
  | 'documentation'
  | 'media'
  | 'future';

export interface ExperienceMeta {
  id: string;
  title: string;
  description: string;
  category: ExperienceCategory;
  tags?: string[];
}

export interface AnalyticsAPI {
  pageView: (title: string, path?: string) => void;
  track: (name: string, params?: Record<string, unknown>) => void;
}

export interface ExperienceContext {
  /** Experience metadata from the registry. */
  meta: ExperienceMeta;
  /** URL parameters for the current route. */
  params: Record<string, string>;
  /** Query string parameters for the current route. */
  query: URLSearchParams;
  /** Shared analytics service. */
  analytics: AnalyticsAPI;
}

export interface ExperienceModule {
  /** Self-describing metadata. The registry JSON is the source of truth at runtime. */
  meta?: ExperienceMeta;
  /**
   * Mount the experience into the supplied container.
   * Optionally return a cleanup function; otherwise implement `unmount`.
   */
  mount: (container: HTMLElement, context: ExperienceContext) => void | (() => void);
  /** Optional explicit teardown. Called when the host is removed from the DOM. */
  unmount?: (container: HTMLElement) => void;
}
