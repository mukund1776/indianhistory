import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchResult } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { PeriodsService } from '../../services/periods.service';

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  private readonly articles = inject(ArticleService);
  private readonly periods = inject(PeriodsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();

  query = '';
  readonly results = signal<SearchResult[]>([]);
  readonly loading = signal(true);
  readonly searched = signal(false);

  async ngOnInit(): Promise<void> {
    // Ensure the article index (and any future async data) is ready before first search
    await this.articles.whenReady();
    this.loading.set(false);

    this.query = this.route.snapshot.queryParamMap.get('q') ?? '';
    this.applySearch();

    this.searchInput$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.query = value;
        this.applySearch();
        void this.updateUrl();
      });

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const fromUrl = params.get('q') ?? '';
        if (fromUrl !== this.query) {
          this.query = fromUrl;
          this.applySearch();
        }
      });
  }

  onQueryInput(value: string): void {
    this.searchInput$.next(value);
  }

  submit(): void {
    this.applySearch();
    void this.updateUrl();
  }

  private applySearch(): void {
    this.searched.set(this.query.trim().length > 0);
    const currentQuery = this.query;
    // Unified search across articles, periods, empires and regional kingdoms
    void this.periods.searchAll(currentQuery).then((res) => {
      if (this.query === currentQuery) {
        this.results.set(res);
      }
    });
  }

  private updateUrl(): Promise<boolean> {
    return this.router.navigate(['/search'], {
      queryParams: { q: this.query.trim() || null },
      replaceUrl: true,
    });
  }
}