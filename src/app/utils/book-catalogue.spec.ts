import { filterBooks } from './book-catalogue';
import { RecommendedBook } from '../models/book.model';

describe('BookCatalogue Utils - filterBooks', () => {
  const sampleBooks: RecommendedBook[] = [
    {
      isbn10: '0140138358',
      isbn13: '9780140138351',
      title: 'A History of India: Volume 1',
      author: 'Romila Thapar',
      category: 'General history',
      description: 'Classic account of early Indian history.',
      format: 'Paperback',
      amazonUrl: 'https://www.amazon.in/dp/0140138358',
      affiliateUrl: 'https://amzn.to/example1',
      customRank: 2,
    },
    {
      isbn10: '0140138366',
      title: 'A History of India: Volume 2',
      author: 'Percival Spear',
      category: 'Colonial & freedom struggle',
      description: 'Covers Mughal and British periods in detail.',
      format: 'Paperback',
      amazonUrl: 'https://www.amazon.in/dp/0140138366',
      customRank: 1,
    },
    {
      isbn10: '0143425129',
      title: 'The Wonder That Was India',
      author: 'A.L. Basham',
      category: 'Society & culture',
      description: 'A survey of the history and culture of the subcontinent.',
      format: 'Paperback',
      amazonUrl: 'https://www.amazon.in/dp/0143425129',
      // No customRank
    },
  ];

  it('should return all books when query is empty, category is "all", and linkStatus is "all"', () => {
    const results = filterBooks(sampleBooks, { query: '', category: 'all', linkStatus: 'all' });
    expect(results.length).toBe(3);
  });

  it('should sort books by customRank in ascending order, followed by unranked books in stable order', () => {
    const results = filterBooks(sampleBooks, { query: '', category: 'all', linkStatus: 'all' });
    expect(results[0].isbn10).toBe('0140138366'); // customRank 1
    expect(results[1].isbn10).toBe('0140138358'); // customRank 2
    expect(results[2].isbn10).toBe('0143425129'); // unranked
  });

  it('should filter by title query case-insensitively', () => {
    const results = filterBooks(sampleBooks, { query: 'wonder', category: 'all', linkStatus: 'all' });
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('The Wonder That Was India');
  });

  it('should filter by author query', () => {
    const results = filterBooks(sampleBooks, { query: 'Thapar', category: 'all', linkStatus: 'all' });
    expect(results.length).toBe(1);
    expect(results[0].author).toBe('Romila Thapar');
  });

  it('should filter by ISBN-10 or ISBN-13', () => {
    const byIsbn10 = filterBooks(sampleBooks, { query: '0143425129', category: 'all', linkStatus: 'all' });
    expect(byIsbn10.length).toBe(1);
    expect(byIsbn10[0].title).toBe('The Wonder That Was India');

    const byIsbn13 = filterBooks(sampleBooks, { query: '9780140138351', category: 'all', linkStatus: 'all' });
    expect(byIsbn13.length).toBe(1);
    expect(byIsbn13[0].isbn10).toBe('0140138358');
  });

  it('should match multiple query terms across different fields (AND logic)', () => {
    const results = filterBooks(sampleBooks, { query: 'Romila 0140138358', category: 'all', linkStatus: 'all' });
    expect(results.length).toBe(1);
    expect(results[0].isbn10).toBe('0140138358');
  });

  it('should filter by category accurately', () => {
    const results = filterBooks(sampleBooks, { query: '', category: 'Society & culture', linkStatus: 'all' });
    expect(results.length).toBe(1);
    expect(results[0].isbn10).toBe('0143425129');
  });

  it('should filter by linkStatus "pending" (books without affiliateUrl)', () => {
    const results = filterBooks(sampleBooks, { query: '', category: 'all', linkStatus: 'pending' });
    expect(results.length).toBe(2);
    expect(results.every(b => !b.affiliateUrl)).toBeTruthy();
  });

  it('should filter by linkStatus "affiliate" (books with affiliateUrl)', () => {
    const results = filterBooks(sampleBooks, { query: '', category: 'all', linkStatus: 'affiliate' });
    expect(results.length).toBe(1);
    expect(results[0].isbn10).toBe('0140138358');
  });
});
