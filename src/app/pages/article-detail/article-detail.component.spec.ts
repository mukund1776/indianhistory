import { Injector, runInInjectionContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ArticleDetailComponent } from './article-detail.component';
import { ArticleService } from '../../services/article.service';
import { PeriodsService } from '../../services/periods.service';
import { LocaleService } from '../../i18n/locale.service';

describe('ArticleDetailComponent', () => {
  let component: ArticleDetailComponent;
  let mockRoute: any;
  let mockPeriodsService: any;

  beforeEach(() => {
    mockRoute = {
      snapshot: {
        paramMap: { get: () => 'attirampakkam-acheulean-stone-tools' },
        queryParamMap: { get: () => null },
      },
    };
    const mockArticles = {
      whenReady: async () => {},
      getBySlug: () => null,
    };
    mockPeriodsService = {
      getPolityBySlug: () => null,
      getBySlug: () => null,
      getThemeBySlug: () => null,
      getPersonalityBySlug: () => null,
    };
    const mockSanitizer = {
      bypassSecurityTrustHtml: (html: string) => html,
    };
    const mockLocale = {
      language: 'en',
      translate: (s: string) => s,
      format: (s: string) => s,
    };

    const injector = Injector.create({
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: ArticleService, useValue: mockArticles },
        { provide: PeriodsService, useValue: mockPeriodsService },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: LocaleService, useValue: mockLocale },
      ],
    });

    component = runInInjectionContext(injector, () => new ArticleDetailComponent());
  });

  it('should initialize with loading true and default backLink', () => {
    expect(component.loading()).toBeTruthy();
    expect(component.backLink()).toBe('/');
  });

  it('should adapt backLink when navigated from search', async () => {
    mockRoute.snapshot.queryParamMap.get = (key: string) => {
      if (key === 'fromSearch') return 'true';
      return null;
    };

    await component.ngOnInit();
    expect(component.backLink()).toBe('/search');
    expect(component.backText()).toContain('search');
  });

  it('should adapt backLink when navigated from a polity', async () => {
    mockRoute.snapshot.queryParamMap.get = (key: string) => {
      if (key === 'fromPolity') return 'maurya';
      return null;
    };
    mockPeriodsService.getPolityBySlug = (slug: string) => {
      if (slug === 'maurya') return { name: 'Mauryan Empire' };
      return null;
    };

    await component.ngOnInit();
    expect(component.backLink()).toBe('/polity/maurya');
    expect(component.backText()).toContain('Mauryan Empire');
  });
});
