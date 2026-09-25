import { ViewportScroller } from '@angular/common';
import { Component, AfterViewInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MustReadComponent } from './components/must-read/must-read.component';
import { BookSidebarComponent } from './components/book-sidebar/book-sidebar.component';
import { ArticleService } from './services/article.service';
import { RecommendedBook } from './models/book.model';
import { getPageBookRecommendations } from './utils/book-recommendations';
import { recommendedBooks } from './data/recommended-books';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MustReadComponent, BookSidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit {
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly router = inject(Router);
  private readonly articles = inject(ArticleService);
  private lastPlacementUrl: string | null = null;
  private placementVersion = 0;
  readonly menuOpen = signal(false);
  readonly highlightedBook = signal<RecommendedBook | null>(null);
  readonly excludedBookIsbns = signal<string[]>([]);
  readonly isBookLibrary = signal(false);

  constructor() {
    void this.updateBookPlacement(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        void this.updateBookPlacement(event.urlAfterRedirects);
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

  private async updateBookPlacement(url: string): Promise<void> {
    if (this.lastPlacementUrl === url) return;
    this.lastPlacementUrl = url;
    const version = ++this.placementVersion;
    const path = url.split('?')[0].split('#')[0];
    this.isBookLibrary.set(path === '/books');
    let storyRecommendations: string[] = [];
    const articleMatch = path.match(/^\/article\/([^/]+)$/);
    if (articleMatch) {
      await this.articles.whenReady();
      if (version !== this.placementVersion) return;
      const article = this.articles.getBySlug(decodeURIComponent(articleMatch[1])) ?? null;
      storyRecommendations = getPageBookRecommendations(article).below.map(book => book.isbn10);
    }

    const nextBook = this.pickRandomBook(storyRecommendations);
    this.highlightedBook.set(nextBook);
    this.excludedBookIsbns.set(
      [...new Set([...storyRecommendations, ...(nextBook ? [nextBook.isbn10] : [])])]
    );
  }

  private pickRandomBook(excludedIsbns: string[]): RecommendedBook | null {
    const previousIsbn = this.highlightedBook()?.isbn10;
    const excluded = new Set([...excludedIsbns, ...(previousIsbn ? [previousIsbn] : [])]);
    const choices = recommendedBooks.filter(book => !excluded.has(book.isbn10));
    if (choices.length) return choices[Math.floor(Math.random() * choices.length)];
    return recommendedBooks.find(book => !excludedIsbns.includes(book.isbn10)) ?? null;
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
