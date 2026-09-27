import { recommendedBooks } from './recommended-books';
import { amazonHistoryBooks } from './amazon-history-books';
import { worldHistoryBooks } from './world-history-books';

describe('Books Data Integrity', () => {
  it('should have a curated list of recommended books', () => {
    expect(recommendedBooks.length).toBeGreaterThan(0);
  });

  it('should ensure all recommended books have required metadata', () => {
    const isbns = new Set<string>();

    for (const book of recommendedBooks) {
      expect(typeof book.title).toBe('string');
      expect(book.title.trim().length).toBeGreaterThan(0);

      expect(typeof book.author).toBe('string');
      expect(book.author.trim().length).toBeGreaterThan(0);

      expect(typeof book.isbn10).toBe('string');
      expect(book.isbn10.trim().length).toBeGreaterThanOrEqual(10);

      expect(typeof book.description).toBe('string');
      expect(book.description.trim().length).toBeGreaterThan(0);

      expect(typeof book.amazonUrl).toBe('string');
      expect(book.amazonUrl.startsWith('https://www.amazon.in/')).toBeTruthy();

      expect(typeof book.category).toBe('string');

      // Check for uniqueness of ISBN
      expect(isbns.has(book.isbn10)).toBeFalsy();
      isbns.add(book.isbn10);
    }
  });

  it('should ensure customRank, when present, is a positive number', () => {
    for (const book of recommendedBooks) {
      if (book.customRank !== undefined) {
        expect(book.customRank).toBeGreaterThan(0);
      }
    }
  });

  it('should ensure larger amazon and world history collections have valid listings', () => {
    expect(amazonHistoryBooks.length).toBeGreaterThan(10);
    expect(worldHistoryBooks.length).toBeGreaterThan(10);

    for (const book of amazonHistoryBooks.slice(0, 10)) {
      expect(book.title).toBeDefined();
      expect(book.author).toBeDefined();
      expect(book.isbn10).toBeDefined();
    }

    for (const book of worldHistoryBooks.slice(0, 10)) {
      expect(book.title).toBeDefined();
      expect(book.author).toBeDefined();
      expect(book.isbn10).toBeDefined();
    }
  });
});
