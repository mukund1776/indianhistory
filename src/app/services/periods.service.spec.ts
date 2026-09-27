import { Injector, runInInjectionContext } from '@angular/core';
import { PeriodsService } from './periods.service';
import { ArticleService } from './article.service';
import { LocaleService } from '../i18n/locale.service';

describe('PeriodsService', () => {
  let service: PeriodsService;

  beforeEach(() => {
    const mockArticlesService = {
      whenReady: async () => {},
      allArticles: () => [],
      search: () => [],
      getBySlug: () => undefined,
    };

    const mockLocaleService = {
      language: 'en',
      translate: (s: string) => s,
      format: (s: string) => s,
    };

    const injector = Injector.create({
      providers: [
        { provide: ArticleService, useValue: mockArticlesService },
        { provide: LocaleService, useValue: mockLocaleService },
      ],
    });

    service = runInInjectionContext(injector, () => new PeriodsService());
  });

  it('should get top level periods', () => {
    const top = service.getTopLevel();
    expect(top.length).toBeGreaterThan(0);
    expect(top.some(p => p.slug === 'prehistory')).toBeTruthy();
  });

  it('should find periods by slug and find parent', () => {
    const period = service.getBySlug('lower-paleolithic');
    expect(period).toBeDefined();
    expect(period?.name).toBe('Lower Paleolithic');

    const parent = service.getParent('lower-paleolithic');
    expect(parent?.slug).toBe('paleolithic');
  });

  it('should filter polities into empires and regional kingdoms', () => {
    const empires = service.getEmpires();
    const kingdoms = service.getRegionalKingdoms();

    expect(empires.length).toBeGreaterThan(0);
    expect(kingdoms.length).toBeGreaterThan(0);
    expect(empires.every(e => e.kind === 'empire')).toBeTruthy();
    expect(kingdoms.every(k => k.kind === 'regional-kingdom')).toBeTruthy();
  });

  it('should retrieve polities by slug', () => {
    const maurya = service.getPolityBySlug('maurya');
    expect(maurya).toBeDefined();
    expect(maurya?.kind).toBe('empire');
  });

  it('should retrieve themes and personalities', () => {
    const themes = service.getThemes();
    expect(themes.length).toBeGreaterThan(0);

    const personalities = service.getPersonalities();
    expect(personalities.length).toBeGreaterThan(0);
  });

  it('should return unified search results across entities when searched', async () => {
    const results = await service.searchAll('Maurya');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.title.toLowerCase().includes('maurya'))).toBeTruthy();
  });
});
