import { Injector, runInInjectionContext } from '@angular/core';
import { BookSidebarComponent } from './book-sidebar.component';
import { LocaleService } from '../../i18n/locale.service';
import { DevModeService } from '../../services/dev-mode.service';
import { RecommendedBook } from '../../models/book.model';

describe('BookSidebarComponent', () => {
  let component: BookSidebarComponent;

  beforeEach(() => {
    const mockLocale = {
      language: 'en',
      translate: (s: string) => s,
    };

    const injector = Injector.create({
      providers: [
        { provide: LocaleService, useValue: mockLocale },
        { provide: DevModeService, useValue: { isDevMode: () => false } },
      ],
    });

    component = runInInjectionContext(injector, () => new BookSidebarComponent());
  });

  it('should initialize with null book by default', () => {
    expect(component.book).toBeNull();
  });

  it('should accept a book input and bind properties correctly', () => {
    const book: RecommendedBook = {
      isbn10: '0140138358',
      title: 'A History of India: Volume 1',
      author: 'Romila Thapar',
      category: 'General history',
      description: 'Account of early Indian history.',
      format: 'Paperback',
      amazonUrl: 'https://www.amazon.in/dp/0140138358',
    };

    component.book = book;
    expect(component.book.title).toBe('A History of India: Volume 1');
    expect(component.book.author).toBe('Romila Thapar');
    expect(component.book.isbn10).toBe('0140138358');
  });
});
