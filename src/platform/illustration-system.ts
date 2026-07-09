import illustrationManifest from '../content/assets/illustration-manifest.json';
import { h, renderAssetImage } from './utils';
import { getCollectionIdentity } from './collection-identity';

interface ExperienceArtwork {
  id: string;
  collection: string;
  motif: string;
  caption: string;
  path: string;
}

type ManifestExperience = {
  collection: string;
  motif: string;
  caption: string;
};

const EXPERIENCE_MANIFEST = illustrationManifest.experiences as Record<string, ManifestExperience>;
const ASSET_ROOT = 'assets/library-season-1';

const EXPERIENCE_ARTWORK: Record<string, ExperienceArtwork> = Object.fromEntries(
  Object.entries(EXPERIENCE_MANIFEST).map(([id, entry]) => [
    id,
    {
      id,
      collection: entry.collection,
      motif: entry.motif,
      caption: entry.caption,
      path: `${ASSET_ROOT}/illustrations/experiences/${id}.svg`,
    },
  ])
) as Record<string, ExperienceArtwork>;

function getExperienceArtwork(experienceId: string): ExperienceArtwork | null {
  return EXPERIENCE_ARTWORK[experienceId] || null;
}

function renderBaseExperienceArtwork(
  experienceId: string,
  {
    className = 'experience-artwork-image',
    decorative = true,
    eager = false,
    width = 320,
    height = 220,
  }: {
    className?: string;
    decorative?: boolean;
    eager?: boolean;
    width?: number;
    height?: number;
  } = {}
): HTMLImageElement | null {
  const artwork = getExperienceArtwork(experienceId);
  if (!artwork) return null;

  return renderAssetImage({
    src: artwork.path,
    alt: decorative ? '' : artwork.caption,
    width,
    height,
    className,
    eager,
  });
}

export function renderExperienceFigure(experienceId: string, title: string): HTMLElement | null {
  const artwork = getExperienceArtwork(experienceId);
  if (!artwork) return null;

  const figure = h('figure', { class: 'experience-hero-figure' }, []);
  const image = renderExperienceHero(experienceId, {
    variant: 'hero',
    className: 'experience-hero-image',
    decorative: false,
    eager: true,
  });

  if (image) {
    figure.appendChild(image);
  }

  const collectionIdentity = getCollectionIdentity(artwork.collection);
  const captionChildren: Array<Node | string> = [
    h('strong', {}, [title]),
    ' — ',
    artwork.caption,
  ];

  if (collectionIdentity) {
    captionChildren.push(' ', h('span', { class: 'meta' }, [`${collectionIdentity.title} motif`]));
  }

  figure.appendChild(h('figcaption', { class: 'experience-hero-caption' }, captionChildren));
  return figure;
}

export const EXP_SLUG_TO_DIR: Record<string, string> = {
  'dueling-accounts': 'h001-dueling-accounts',
  'constraint': 'c002-constraint',
  'bridge-builder': 'e001-bridge-builder',
  'optimization': 'e003-optimization',
  'attention': 'x001-attention',
  'proof': 'm005-proof',
  'watershed': 'n005-watershed',
  'pattern-garden': 'f003-pattern-garden',
};

export function renderExperienceHero(
  experienceId: string,
  {
    variant = 'hero',
    className = 'experience-hero-image',
    decorative = true,
    eager = false,
  }: {
    variant?: 'hero' | 'thumbnail';
    className?: string;
    decorative?: boolean;
    eager?: boolean;
  } = {}
): HTMLImageElement | null {
  const artwork = getExperienceArtwork(experienceId);
  if (!artwork) return null;

  const dirName = EXP_SLUG_TO_DIR[experienceId];
  if (!dirName) {
    // Graceful fallback to the generated artwork if no production asset exists
    return renderBaseExperienceArtwork(experienceId, {
      className,
      decorative,
      eager,
      width: variant === 'hero' ? 640 : 320,
      height: variant === 'hero' ? 440 : 220,
    });
  }

  const width = variant === 'hero' ? 1600 : 1200;
  const height = variant === 'hero' ? 900 : 900;

  return renderAssetImage({
    src: `assets/library/experiences/${dirName}/${variant}.svg`,
    alt: decorative ? '' : artwork.caption,
    width,
    height,
    className,
    eager,
  });
}

export function renderLibraryHero({
  className = 'library-hero-image',
  eager = false,
  decorative = true,
}: {
  className?: string;
  eager?: boolean;
  decorative?: boolean;
} = {}): HTMLImageElement {
  return renderAssetImage({
    src: 'assets/library/hero/library-season-1/library-hero.svg',
    alt: decorative ? '' : 'Library Season 1',
    width: 3840,
    height: 1600,
    className,
    eager,
  });
}

export function renderBookmarkIcon(className = 'bookmark-icon', decorative = true): HTMLImageElement {
  return renderAssetImage({
    src: `${ASSET_ROOT}/icons/bookmark.svg`,
    alt: decorative ? '' : 'Bookmark',
    width: 20,
    height: 20,
    className,
  });
}
