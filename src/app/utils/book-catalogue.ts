import { RecommendedBook } from '../models/book.model';

export interface BookFilters {
  query: string;
  category: string;
  linkStatus: string;
}

export function filterBooks(books: readonly RecommendedBook[], filters: BookFilters): RecommendedBook[] {
  const terms = filters.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return books.filter(book => {
    const text = `${book.title} ${book.author} ${book.description} ${book.category ?? ''} ${book.publisher ?? ''} ${book.isbn10} ${book.isbn13 ?? ''}`.toLocaleLowerCase();
    return terms.every(term => text.includes(term))
      && (filters.category === 'all' || book.category === filters.category)
      && (filters.linkStatus === 'all' || (filters.linkStatus === 'pending' ? !book.affiliateUrl : !!book.affiliateUrl));
  }).map((book, index) => ({ book, index }))
    .sort((a, b) => {
      const rankA = a.book.customRank;
      const rankB = b.book.customRank;
      if (rankA != null && rankB != null && rankA !== rankB) return rankA - rankB;
      if (rankA != null && rankB == null) return -1;
      if (rankA == null && rankB != null) return 1;
      return a.index - b.index;
    })
    .map(({ book }) => book);
}
