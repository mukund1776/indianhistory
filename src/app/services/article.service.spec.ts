import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ArticleService } from './article.service';
import { LocaleService } from '../i18n/locale.service';
import { Article, SearchEntry } from '../models/article.model';

describe('ArticleService', () => {
  let service: ArticleService;
  const mockArticles: Article[] = [
    {
      slug: 'attirampakkam-acheulean-stone-tools',
      title: 'Attirampakkam Acheulean Stone Tools',
      excerpt: 'Prehistoric stone tools from Tamil Nadu',
      html: '<p>Excavations revealed Lower Paleolithic tools.</p>',
      publishedAt: '2026-01-01',
      tags: ['Prehistory', 'Archaeology'],
      books: [],
    },
    {
      slug: 'poompuhar-dispute',
      title: 'Poompuhar Submerged Port',
      excerpt: 'Submerged coastal structures at Poompuhar',
      html: '<p>Disputed marine archaeology claims.</p>',
      publishedAt: '2026-02-01',
      tags: ['Maritime', 'Sangam'],
      books: [],
    },
  ];

  const mockIndex: SearchEntry[] = [
    {
      slug: 'attirampakkam-acheulean-stone-tools',
      title: 'Attirampakkam Acheulean Stone Tools',
      excerpt: 'Prehistoric stone tools from Tamil Nadu',
      text: 'Attirampakkam Acheulean Stone Tools Lower Paleolithic',
    },
    {
      slug: 'poompuhar-dispute',
      title: 'Poompuhar Submerged Port',
      excerpt: 'Submerged coastal structures at Poompuhar',
      text: 'Poompuhar Submerged Port Marine Archaeology',
    },
  ];

  beforeEach(() => {
    const mockHttp = {
      get: (url: string) => {
        if (url.includes('articles.json')) return of(mockArticles);
        if (url.includes('search-index.json')) return of(mockIndex);
        return of([]);
      },
    };

    const mockLocale = {
      language: 'en',
      navigation: { worldHistory: 'World History' },
      translationAvailable: { set: () => {} },
    };

    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: LocaleService, useValue: mockLocale },
      ],
    });

    service = runInInjectionContext(injector, () => new ArticleService());
    (service as any).articles.set(mockArticles);
    (service as any).searchIndex.set(mockIndex);
  });

  it('should retrieve article by slug', () => {
    const article = service.getBySlug('attirampakkam-acheulean-stone-tools');
    expect(article).toBeDefined();
    expect(article?.title).toBe('Attirampakkam Acheulean Stone Tools');

    const notFound = service.getBySlug('unknown-slug');
    expect(notFound).toBeUndefined();
  });

  it('should expose allArticles signal', () => {
    const all = service.allArticles();
    expect(all.length).toBe(2);
    expect(all[0].slug).toBe('attirampakkam-acheulean-stone-tools');
  });

  it('should search articles matching title, excerpt or text', () => {
    const results = service.search('Paleolithic');
    expect(results.length).toBe(1);
    expect(results[0].slug).toBe('attirampakkam-acheulean-stone-tools');

    const marineResults = service.search('marine');
    expect(marineResults.length).toBe(1);
    expect(marineResults[0].slug).toBe('poompuhar-dispute');
  });

  it('should return empty array for empty search queries', () => {
    expect(service.search('').length).toBe(0);
    expect(service.search('   ').length).toBe(0);
  });

  it('reveals world history when a story is assigned to it', () => {
    expect(service.hasWorldHistoryStories()).toBeFalsy();
    (service as any).articles.set([{ ...mockArticles[0], themes: ['world-history'] }]);
    expect(service.hasWorldHistoryStories()).toBeTruthy();
  });
});
