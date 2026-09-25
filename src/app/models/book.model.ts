export interface RecommendedBook {
  title: string;
  author: string;
  /** Lower numbers appear first; equal or missing ranks preserve source order. */
  customRank?: number;
  category?: string;
  sourceUrl?: string;
  linkVerifiedOn?: string;
  linkVerification?: 'publisher' | 'amazon';
  description: string;
  amazonUrl: string;
  affiliateUrl?: string;
  imageUrl: string;
  imageAlt: string;
  format: string;
  publisher: string;
  publicationDate: string;
  pages: number;
  isbn10: string;
  isbn13: string;
}
