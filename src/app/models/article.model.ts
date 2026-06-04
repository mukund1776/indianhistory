export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  period?: string; // slug of the broad period (e.g. 'medieval')
  polity?: string; // slug of the specific empire/kingdom (e.g. 'mughal')
  themes: string[]; // slugs of cross-period themes (e.g. 'rise-of-buddhism-jainism')
  personalities: string[]; // slugs of historical people (e.g. 'ashoka')
}

export interface SearchEntry {
  title: string;
  slug: string;
  excerpt: string;
  text: string;
}

export type SearchResultKind = 'article' | 'period' | 'polity' | 'theme' | 'personality' | 'book';

export interface SearchResult {
  kind: SearchResultKind;
  slug: string;
  title: string;
  excerpt: string;
  // Used for routerLink when the result points to an internal page.
  routerLink?: any[];
  // Used when the result points to an external destination.
  externalUrl?: string;
  // Optional query params (e.g. fromSearch for articles)
  queryParams?: Record<string, any>;
  // For display: e.g. "Empire", "Regional Kingdom", "Period", "Story"
  kindLabel: string;
}
