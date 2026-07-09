import illustrationManifest from '../content/assets/illustration-manifest.json';
import { assetUrl, renderAssetImage } from './utils';

interface CollectionPalette {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
}

export interface CollectionIdentity {
  id: string;
  title: string;
  direction: string;
  motif: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    surfaceColor: string;
    surfaceAltColor: string;
    inkColor: string;
    backgroundGradient: string;
    iconPath: string;
    badgePath: string;
    patternPath: string;
    backgroundPath: string;
  };
}

type ManifestCollection = {
  title: string;
  direction: string;
  motif: string;
  palette: CollectionPalette;
};

const COLLECTION_MANIFEST = illustrationManifest.collections as Record<string, ManifestCollection>;
const ASSET_ROOT = 'assets/library-season-1';

const COLLECTION_IDENTITIES: Record<string, CollectionIdentity> = Object.fromEntries(
  Object.entries(COLLECTION_MANIFEST).map(([id, entry]) => {
    const palette = entry.palette;
    return [
      id,
      {
        id,
        title: entry.title,
        direction: entry.direction,
        motif: entry.motif,
        theme: {
          primaryColor: palette.primary,
          secondaryColor: palette.secondary,
          accentColor: palette.accent,
          surfaceColor: palette.surface,
          surfaceAltColor: palette.surfaceAlt,
          inkColor: palette.ink,
          backgroundGradient: `linear-gradient(180deg, ${palette.surface} 0%, ${palette.surfaceAlt} 100%)`,
          iconPath: `${ASSET_ROOT}/icons/${id}.svg`,
          badgePath: `${ASSET_ROOT}/collection-badges/${id}.svg`,
          patternPath: `${ASSET_ROOT}/patterns/${id}.svg`,
          backgroundPath: `${ASSET_ROOT}/backgrounds/${id}.svg`,
        },
      },
    ];
  })
) as Record<string, CollectionIdentity>;

export function getCollectionIdentity(collectionId: string): CollectionIdentity | null {
  return COLLECTION_IDENTITIES[collectionId] || null;
}

export function getCollectionCSSVariables(collectionId: string): string {
  const identity = getCollectionIdentity(collectionId);
  if (!identity) return '';

  return [
    `--collection-primary: ${identity.theme.primaryColor}`,
    `--collection-secondary: ${identity.theme.secondaryColor}`,
    `--collection-accent: ${identity.theme.accentColor}`,
    `--collection-surface: ${identity.theme.surfaceColor}`,
    `--collection-surface-alt: ${identity.theme.surfaceAltColor}`,
    `--collection-ink: ${identity.theme.inkColor}`,
    `--collection-gradient: ${identity.theme.backgroundGradient}`,
    `--collection-pattern-url: url('${assetUrl(identity.theme.patternPath)}')`,
    `--collection-background-url: url('${assetUrl(identity.theme.backgroundPath)}')`,
  ].join('; ');
}


export function renderCollectionIcon(
  collectionId: string,
  size = 24,
  className = 'collection-icon-svg',
  decorative = true,
): HTMLImageElement | null {
  const identity = getCollectionIdentity(collectionId);
  if (!identity) return null;

  return renderAssetImage({
    src: identity.theme.iconPath,
    alt: decorative ? '' : `${identity.title} icon`,
    width: size,
    height: size,
    className,
  });
}

export function renderCollectionBadge(
  collectionId: string,
  size = 72,
  className = 'collection-badge-image',
  decorative = true,
): HTMLImageElement | null {
  const identity = getCollectionIdentity(collectionId);
  if (!identity) return null;

  return renderAssetImage({
    src: identity.theme.badgePath,
    alt: decorative ? '' : `${identity.title} badge`,
    width: size,
    height: size,
    className,
  });
}

export function renderCollectionCover(
  collectionId: string,
  {
    variant = 'cover',
    className = 'collection-cover-image',
    decorative = true,
  }: {
    variant?: 'cover' | 'thumbnail';
    className?: string;
    decorative?: boolean;
  } = {}
): HTMLImageElement | null {
  const identity = getCollectionIdentity(collectionId);
  if (!identity) return null;

  const width = variant === 'cover' ? 2400 : 600;
  const height = variant === 'cover' ? 1600 : 400;

  return renderAssetImage({
    src: `assets/library/collections/${collectionId}/${variant}.svg`,
    alt: decorative ? '' : `${identity.title} collection ${variant}`,
    width,
    height,
    className,
  });
}

