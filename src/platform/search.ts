import searchIndex from '../generated/search-index.json' assert { type: 'json' };

export interface SearchResult {
  id: string;
  type: 'experience' | 'collection' | 'story';
  title: string;
  description: string;
  tags?: string[];
  collection?: string;
  relevance: number;
}

const index = searchIndex as Array<{
  id: string;
  type: string;
  title: string;
  description: string;
  tags?: string[];
  collection?: string;
}>;

export function search(query: string): SearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const terms = normalized.split(/\s+/).filter(t => t.length > 0);

  return index
    .map(item => {
      let relevance = 0;
      const text = `${item.title} ${item.description} ${item.tags?.join(' ') ?? ''}`.toLowerCase();

      terms.forEach(term => {
        // Title match is highest relevance
        if (item.title.toLowerCase().includes(term)) relevance += 10;
        // Description match
        if (item.description.toLowerCase().includes(term)) relevance += 5;
        // Tag match
        if (item.tags?.some(t => t.toLowerCase().includes(term))) relevance += 7;
        // General text match
        if (text.includes(term)) relevance += 2;
        // Exact title match gets bonus
        if (item.title.toLowerCase() === normalized) relevance += 15;
      });

      return { ...item, relevance } as SearchResult;
    })
    .filter(r => r.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance);
}

export function searchExperiences(query: string): SearchResult[] {
  return search(query).filter(r => r.type === 'experience');
}

export function searchCollections(query: string): SearchResult[] {
  return search(query).filter(r => r.type === 'collection');
}
