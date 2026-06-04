import { ViewportScroller } from '@angular/common';
import { Component, AfterViewInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MustReadComponent } from './components/must-read/must-read.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MustReadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit {
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly router = inject(Router);
  readonly menuOpen = signal(false);
  readonly isSearchPage = signal(false);

  constructor() {
    this.isSearchPage.set(this.router.url.split('?')[0] === '/search');
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isSearchPage.set(event.urlAfterRedirects.split('?')[0] === '/search');
      });
  }

  ngAfterViewInit(): void {
    // Set exact pixel height of the sticky header so that fragment navigation
    // (Timeline / Empires / Kingdoms links) scrolls the target just below the header
    // instead of hiding the section title behind it.
    this.viewportScroller.setOffset(() => [0, this.headerOffset()]);
    document.documentElement.style.setProperty('--header-height', `${this.headerOffset()}px`);
  }

  private headerOffset(): number {
    const header = document.querySelector('.site-header') as HTMLElement | null;
    return header ? header.offsetHeight + 12 : 0;
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
