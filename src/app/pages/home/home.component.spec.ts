import { Injector, runInInjectionContext, signal } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HomeComponent } from './home.component';
import { ArticleService } from '../../services/article.service';
import { PeriodsService } from '../../services/periods.service';
import { LocaleService } from '../../i18n/locale.service';
import { ArticleSummary } from '../../models/article.model';
import { DevModeService } from '../../services/dev-mode.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let devMode: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    devMode = signal(false);
    const mockArticlesSvc = {
      whenReady: async () => {},
      allArticles: () => [],
      hasWorldHistoryStories: () => false,
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
        { provide: DevModeService, useValue: { isDevMode: devMode } },
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

  it('shows empty section cards only in dev mode', () => {
    component.timelinePeriods.set([
      { slug: 'prehistory', name: 'Prehistory', range: '', description: '', articleCount: 3 },
      { slug: 'medieval', name: 'Medieval', range: '', description: '', articleCount: 0 },
    ]);
    expect(component.visibleTimelinePeriods().map(period => period.slug)).toEqual(['prehistory']);
    devMode.set(true);
    expect(component.visibleTimelinePeriods().map(period => period.slug)).toEqual(['prehistory', 'medieval']);
  });

  it('should use the generated thumbnail metadata', () => {
    const articleWithImage: ArticleSummary = {
      slug: 'stone-tools',
      title: 'Stone Tools',
      excerpt: 'Old tools',
      thumbnail: { src: '/assets/media/tools.jpg', alt: 'Acheulean tools' },
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
    const articleWithoutImage: ArticleSummary = {
      slug: 'no-image',
      title: 'No Image',
      excerpt: 'Text only',
      publishedAt: '2026-01-01',
      tags: [],
      books: [],
    };

    const thumb = component.thumbnail(articleWithoutImage);
    expect(thumb).toBeNull();
  });
});
