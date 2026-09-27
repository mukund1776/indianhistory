import { Injector, runInInjectionContext } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { ArticleService } from './services/article.service';
import { DevModeService } from './services/dev-mode.service';
import { LocaleService } from './i18n/locale.service';

describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(() => {
    const mockViewportScroller = {
      setOffset: () => {},
    };
    const mockRouter = {
      url: '/',
      navigated: true,
      events: {
        subscribe: () => ({ unsubscribe: () => {} }),
      },
    };
    const mockArticles = {
      whenReady: async () => {},
      getBySlug: () => null,
    };
    const mockDevMode = {
      isDevMode: () => false,
    };
    const mockLocale = {
      language: 'en',
      translate: (s: string) => s,
      translateDocument: () => {},
    };

    const injector = Injector.create({
      providers: [
        { provide: ViewportScroller, useValue: mockViewportScroller },
        { provide: Router, useValue: mockRouter },
        { provide: ArticleService, useValue: mockArticles },
        { provide: DevModeService, useValue: mockDevMode },
        { provide: LocaleService, useValue: mockLocale },
      ],
    });

    component = runInInjectionContext(injector, () => new AppComponent());
  });

  it('should initialize with menu closed', () => {
    expect(component.menuOpen()).toBeFalsy();
  });

  it('should toggle menu open and closed', () => {
    component.toggleMenu();
    expect(component.menuOpen()).toBeTruthy();

    component.toggleMenu();
    expect(component.menuOpen()).toBeFalsy();
  });

  it('should explicitly close menu when closeMenu is called', () => {
    component.toggleMenu();
    expect(component.menuOpen()).toBeTruthy();

    component.closeMenu();
    expect(component.menuOpen()).toBeFalsy();
  });
});
