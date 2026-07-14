import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { recommendedBooks } from '../../data/recommended-books';
import { LazyImageDirective } from '../../directives/lazy-image.directive';
import { Article } from '../../models/article.model';
import { RecommendedBook } from '../../models/book.model';
import { ArticleService } from '../../services/article.service';
import { PeriodsService } from '../../services/periods.service';

@Component({
  selector: 'app-article-detail',
  imports: [RouterLink, DatePipe, LazyImageDirective],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.css',
})
export class ArticleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly articles = inject(ArticleService);
  private readonly periodsService = inject(PeriodsService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly article = signal<Article | null>(null);
  readonly html = signal<SafeHtml | null>(null);
  readonly relatedBooks = signal<RecommendedBook[]>([]);
  readonly suggestedBook = signal<RecommendedBook | null>(null);
  readonly bottomBooks = signal<RecommendedBook[]>([]);
  readonly loading = signal(true);
  readonly backLink = signal<string>('/');
  readonly backText = signal<string>('← All stories');

  async ngOnInit(): Promise<void> {
    await this.articles.whenReady();
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const found = this.articles.getBySlug(slug) ?? null;
    const books = found ? this.booksForArticle(found) : [];
    this.article.set(found);
    this.relatedBooks.set(books);
    this.suggestedBook.set(books[0] ?? recommendedBooks[0] ?? null);
    this.bottomBooks.set(this.booksForBottom(books, this.suggestedBook()));
    this.html.set(
      found ? this.sanitizer.bypassSecurityTrustHtml(found.html) : null
    );

    // Context-aware back navigation
    const fromPeriodSlug = this.route.snapshot.queryParamMap.get('fromPeriod');
    const fromPolitySlug = this.route.snapshot.queryParamMap.get('fromPolity');
    const fromThemeSlug = this.route.snapshot.queryParamMap.get('fromTheme');
    const fromPersonalitySlug = this.route.snapshot.queryParamMap.get('fromPersonality');
    const fromSearch = this.route.snapshot.queryParamMap.get('fromSearch');
    if (fromPolitySlug) {
      const pol = this.periodsService.getPolityBySlug(fromPolitySlug);
      if (pol) {
        this.backLink.set(`/polity/${fromPolitySlug}`);
        this.backText.set(`← Back to ${pol.name}`);
      } else {
        this.backLink.set('/');
        this.backText.set('← All stories');
      }
    } else if (fromThemeSlug) {
      const theme = this.periodsService.getThemeBySlug(fromThemeSlug);
      if (theme) {
        this.backLink.set(`/theme/${fromThemeSlug}`);
        this.backText.set(`← Back to ${theme.name}`);
      } else {
        this.backLink.set('/');
        this.backText.set('← All stories');
      }
    } else if (fromPersonalitySlug) {
      const personality = this.periodsService.getPersonalityBySlug(fromPersonalitySlug);
      if (personality) {
        this.backLink.set(`/personality/${fromPersonalitySlug}`);
        this.backText.set(`← Back to ${personality.name}`);
      } else {
        this.backLink.set('/');
        this.backText.set('← All stories');
      }
    } else if (fromPeriodSlug) {
      const parentPeriod = this.periodsService.getBySlug(fromPeriodSlug);
      if (parentPeriod) {
        this.backLink.set(`/period/${fromPeriodSlug}`);
        this.backText.set(`← Back to ${parentPeriod.name}`);
      } else {
        this.backLink.set('/');
        this.backText.set('← All stories');
      }
    } else if (fromSearch) {
      this.backLink.set('/search');
      this.backText.set('← Back to search');
    } else {
      this.backLink.set('/');
      this.backText.set('← All stories');
    }

    this.loading.set(false);
  }

  private booksForArticle(article: Article): RecommendedBook[] {
    if (!article.books.length) {
      return [];
    }

    const requested = new Set(article.books);
    return recommendedBooks.filter((book) => requested.has(book.isbn10));
  }

  private booksForBottom(articleBooks: RecommendedBook[], suggested: RecommendedBook | null): RecommendedBook[] {
    const source = articleBooks.length ? articleBooks : recommendedBooks;
    const different = source.filter((book) => book.isbn10 !== suggested?.isbn10);
    const fallbackDifferent = recommendedBooks.filter(
      (book) => book.isbn10 !== suggested?.isbn10 && !different.some((item) => item.isbn10 === book.isbn10)
    );
    const books = [...different, ...fallbackDifferent].slice(0, 2);

    if (books.length < 2 && suggested) {
      books.push(suggested);
    }

    return books;
  }
}
