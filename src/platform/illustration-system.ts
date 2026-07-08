import illustrationManifest from '../content/assets/illustration-manifest.json';
import { assetUrl, h } from './utils';
import { getCollectionIdentity } from './collection-identity';

export interface ExperienceArtwork {
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

export const EXPERIENCE_ARTWORK: Record<string, ExperienceArtwork> = Object.fromEntries(
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

function renderAssetImage({
  src,
  alt,
  width,
  height,
  className = '',
  eager = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  eager?: boolean;
}): HTMLImageElement {
  return h('img', {
    src: assetUrl(src),
    alt,
    width,
    height,
    class: className,
    decoding: 'async',
    loading: eager ? 'eager' : 'lazy',
  });
}

export function getExperienceArtwork(experienceId: string): ExperienceArtwork | null {
  return EXPERIENCE_ARTWORK[experienceId] || null;
}

export function renderExperienceArtwork(
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
  const image = renderExperienceArtwork(experienceId, {
    className: 'experience-hero-image',
    decorative: false,
    eager: true,
    width: 640,
    height: 440,
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

export function renderBookmarkIcon(className = 'bookmark-icon', decorative = true): HTMLImageElement {
  return renderAssetImage({
    src: `${ASSET_ROOT}/icons/bookmark.svg`,
    alt: decorative ? '' : 'Bookmark',
    width: 20,
    height: 20,
    className,
  });
}
