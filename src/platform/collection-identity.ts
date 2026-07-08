/**
 * Collection Identity System
 * 
 * Each collection has a distinctive visual identity that gives it personality
 * while maintaining cohesion within the ITTYBITTYBITES platform.
 */

export interface CollectionIdentity {
  id: string;
  name: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundGradient: string;
    icon: string;
    pattern: string;
    mood: string;
  };
}

export const COLLECTION_IDENTITIES: Record<string, CollectionIdentity> = {
  foundations: {
    id: 'foundations',
    name: 'Foundations',
    theme: {
      primaryColor: '#6B7280',
      secondaryColor: '#9CA3AF',
      accentColor: '#D1D5DB',
      backgroundGradient: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)',
      icon: '🏛️',
      pattern: 'geometric',
      mood: 'Stone, geometric forms, solid and reliable'
    }
  },
  history: {
    id: 'history',
    name: 'History',
    theme: {
      primaryColor: '#92400E',
      secondaryColor: '#B45309',
      accentColor: '#D97706',
      backgroundGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      icon: '📜',
      pattern: 'archival',
      mood: 'Aged paper, bronze, archival textures, timeless'
    }
  },
  science: {
    id: 'science',
    name: 'Science',
    theme: {
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      accentColor: '#60A5FA',
      backgroundGradient: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
      icon: '🔬',
      pattern: 'grid',
      mood: 'Glass, light, subtle grids, precision'
    }
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    theme: {
      primaryColor: '#065F46',
      secondaryColor: '#059669',
      accentColor: '#10B981',
      backgroundGradient: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
      icon: '🌿',
      pattern: 'organic',
      mood: 'Organic shapes, flowing forms, living systems'
    }
  },
  creativity: {
    id: 'creativity',
    name: 'Creativity',
    theme: {
      primaryColor: '#7C2D12',
      secondaryColor: '#DC2626',
      accentColor: '#F59E0B',
      backgroundGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FECACA 50%, #E9D5FF 100%)',
      icon: '🎨',
      pattern: 'layered',
      mood: 'Bold color, layered compositions, expressive'
    }
  },
  engineering: {
    id: 'engineering',
    name: 'Engineering',
    theme: {
      primaryColor: '#1E3A8A',
      secondaryColor: '#1E40AF',
      accentColor: '#3B82F6',
      backgroundGradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
      icon: '⚙️',
      pattern: 'blueprint',
      mood: 'Precision lines, blueprints, technical accuracy'
    }
  },
  mathematics: {
    id: 'mathematics',
    name: 'Mathematics',
    theme: {
      primaryColor: '#4C1D95',
      secondaryColor: '#6D28D9',
      accentColor: '#A78BFA',
      backgroundGradient: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
      icon: '📐',
      pattern: 'grid',
      mood: 'Geometric precision, violet hues, abstract structure'
    }
  },
  'society-mind': {
    id: 'society-mind',
    name: 'Society & Mind',
    theme: {
      primaryColor: '#831843',
      secondaryColor: '#BE185D',
      accentColor: '#F472B6',
      backgroundGradient: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 50%, #E0E7FF 100%)',
      icon: '🧠',
      pattern: 'network',
      mood: 'Warm pinks and indigo, connected nodes, bridges between minds'
    }
  }
};

/**
 * Get the visual identity for a collection
 */
export function getCollectionIdentity(collectionId: string): CollectionIdentity | null {
  return COLLECTION_IDENTITIES[collectionId] || null;
}

/**
 * Apply collection identity styles to an element
 */
export function applyCollectionTheme(element: HTMLElement, collectionId: string): void {
  const identity = getCollectionIdentity(collectionId);
  if (!identity) return;

  element.style.setProperty('--collection-primary', identity.theme.primaryColor);
  element.style.setProperty('--collection-secondary', identity.theme.secondaryColor);
  element.style.setProperty('--collection-accent', identity.theme.accentColor);
  element.style.background = identity.theme.backgroundGradient;
}

/**
 * Generate CSS custom properties for a collection theme
 */
export function getCollectionCSSVariables(collectionId: string): string {
  const identity = getCollectionIdentity(collectionId);
  if (!identity) return '';

  return `
    --collection-primary: ${identity.theme.primaryColor};
    --collection-secondary: ${identity.theme.secondaryColor};
    --collection-accent: ${identity.theme.accentColor};
  `;
}
