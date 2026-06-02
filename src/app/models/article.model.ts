export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
}

export interface SearchEntry {
  title: string;
  slug: string;
  excerpt: string;
  text: string;
}