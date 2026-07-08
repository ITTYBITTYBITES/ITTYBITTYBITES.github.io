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
    icon: string; // Emoji fallback
    svgIcon: string; // SVG icon path data
    pattern: string;
    mood: string;
    borderAccent: string;
    hoverColor: string;
    textOnAccent: string;
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
      svgIcon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22 9 12 15 12 15 22',
      pattern: 'geometric',
      mood: 'Stone, geometric forms, solid and reliable',
      borderAccent: '#6B7280',
      hoverColor: '#F3F4F6',
      textOnAccent: '#1F2937'
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
      svgIcon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2 14 8 20 8 M16 13 8 13 M16 17 8 17 M10 9 9 9 8 9',
      pattern: 'archival',
      mood: 'Aged paper, bronze, archival textures, timeless',
      borderAccent: '#92400E',
      hoverColor: '#FFFBEB',
      textOnAccent: '#78350F'
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
      svgIcon: 'M14.31 8 20.05 17.94 M9.69 8 21.17 8 M7.38 12 13.12 2.06 M9.69 16 3.95 6.06 M14.31 16 2.83 16 M16.62 12 10.88 21.94',
      pattern: 'grid',
      mood: 'Glass, light, subtle grids, precision',
      borderAccent: '#1E40AF',
      hoverColor: '#EFF6FF',
      textOnAccent: '#1E3A8A'
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
      svgIcon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z M12 12h.01',
      pattern: 'organic',
      mood: 'Organic shapes, flowing forms, living systems',
      borderAccent: '#065F46',
      hoverColor: '#ECFDF5',
      textOnAccent: '#064E3B'
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
      svgIcon: 'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586 M11 11h.01',
      pattern: 'layered',
      mood: 'Bold color, layered compositions, expressive',
      borderAccent: '#7C2D12',
      hoverColor: '#FFF7ED',
      textOnAccent: '#7C2D12'
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
      svgIcon: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
      pattern: 'blueprint',
      mood: 'Precision lines, blueprints, technical accuracy',
      borderAccent: '#1E3A8A',
      hoverColor: '#EFF6FF',
      textOnAccent: '#1E3A8A'
    }
  },
  mathematics: {
    id: 'mathematics',
    name: 'Mathematics',
    theme: {
      primaryColor: '#7C3AED',
      secondaryColor: '#8B5CF6',
      accentColor: '#A78BFA',
      backgroundGradient: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
      icon: '📐',
      svgIcon: 'M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z',
      pattern: 'pattern',
      mood: 'Elegant, pattern-based, symmetrical, abstract beauty',
      borderAccent: '#7C3AED',
      hoverColor: '#F5F3FF',
      textOnAccent: '#5B21B6'
    }
  },
  'society-mind': {
    id: 'society-mind',
    name: 'Society & Mind',
    theme: {
      primaryColor: '#BE185D',
      secondaryColor: '#DB2777',
      accentColor: '#EC4899',
      backgroundGradient: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)',
      icon: '🧠',
      svgIcon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
      pattern: 'network',
      mood: 'Networked, conversational, human, interconnected',
      borderAccent: '#BE185D',
      hoverColor: '#FDF2F8',
      textOnAccent: '#9D174D'
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
    --collection-border: ${identity.theme.borderAccent};
    --collection-hover: ${identity.theme.hoverColor};
    --collection-text: ${identity.theme.textOnAccent};
  `;
}

/**
 * Render SVG icon for a collection
 */
export function renderCollectionIcon(collectionId: string, size: number = 24, className: string = ''): SVGElement | null {
  const identity = getCollectionIdentity(collectionId);
  if (!identity) return null;
  
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg') as SVGElement;
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  if (className) svg.setAttribute('class', className);
  
  // Parse the svgIcon path data and create path elements
  const pathData = identity.theme.svgIcon;
  const pathCommands = pathData.split(/(?=[MmLlHhVvCcSsQqTtAaZz])/);
  
  pathCommands.forEach(cmd => {
    if (cmd.trim()) {
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', cmd.trim());
      svg.appendChild(path);
    }
  });
  
  return svg;
}

/**
 * Get icon HTML string for a collection (for use in innerHTML)
 */
export function getCollectionIconHTML(collectionId: string, size: number = 24): string {
  const identity = getCollectionIdentity(collectionId);
  if (!identity) return '';
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${identity.theme.svgIcon}"/></svg>`;
}
