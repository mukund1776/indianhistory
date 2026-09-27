import { Injector, runInInjectionContext } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HomeComponent } from './home.component';
import { ArticleService } from '../../services/article.service';
import { PeriodsService } from '../../services/periods.service';
import { LocaleService } from '../../i18n/locale.service';
import { Article } from '../../models/article.model';

describe('HomeComponent', () => {
  let component: HomeComponent;

  beforeEach(() => {
    const mockArticlesSvc = {
      whenReady: async () => {},
      allArticles: () => [],
    };
    const mockPeriodsSvc = {
      getBySlug: () => null,
      getArticleCount: async () => 0,
      getThemes: () => [],
      getPersonalities: () => [],
      getEmpires: () => [],
      getRegionalKingdoms: () => [],
    };
    const mockRoute = {
      snapshot: { fragment: '' },
    };
    const mockViewportScroller = {
      scrollToAnchor: () => {},
    };
    const mockLocale = {
      language: 'en',
      translate: (s: string) => s,
      format: (s: string) => s,
    };

    const injector = Injector.create({
      providers: [
        { provide: ArticleService, useValue: mockArticlesSvc },
        { provide: PeriodsService, useValue: mockPeriodsSvc },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: ViewportScroller, useValue: mockViewportScroller },
        { provide: LocaleService, useValue: mockLocale },
      ],
    });

    component = runInInjectionContext(injector, () => new HomeComponent());
  });

  it('should initialize with empty lists and loading true', () => {
    expect(component.loading()).toBeTruthy();
    expect(component.list().length).toBe(0);
    expect(component.timelinePeriods().length).toBe(0);
    expect(component.empires().length).toBe(0);
  });

  it('should extract image src and alt from article html in thumbnail method', () => {
    const articleWithImage: Article = {
      slug: 'stone-tools',
      title: 'Stone Tools',
      excerpt: 'Old tools',
      html: '<p>Some text</p><img src="/assets/media/tools.jpg" alt="Acheulean tools" /><p>More text</p>',
      publishedAt: '2026-01-01',
      tags: [],
      books: [],
    };

    const thumb = component.thumbnail(articleWithImage);
    expect(thumb).not.toBeNull();
    expect(thumb?.src).toBe('/assets/media/tools.jpg');
    expect(thumb?.alt).toBe('Acheulean tools');
  });

  it('should return null when article has no images', () => {
    const articleWithoutImage: Article = {
      slug: 'no-image',
      title: 'No Image',
      excerpt: 'Text only',
      html: '<p>Only text here.</p>',
      publishedAt: '2026-01-01',
      tags: [],
      books: [],
    };

    const thumb = component.thumbnail(articleWithoutImage);
    expect(thumb).toBeNull();
  });
});
