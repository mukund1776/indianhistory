import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchResult } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { PeriodsService } from '../../services/periods.service';

const SEARCH_DEBOUNCE_MS = 300;

type SearchFilter = 'all' | 'article' | 'book' | 'period' | 'theme' | 'personality' | 'empire' | 'kingdom';

interface SearchFilterOption {
  label: string;
  value: SearchFilter;
}

const FILTER_OPTIONS: SearchFilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Stories', value: 'article' },
  { label: 'Books', value: 'book' },
  { label: 'Periods', value: 'period' },
  { label: 'Themes', value: 'theme' },
  { label: 'Personalities', value: 'personality' },
  { label: 'Empires', value: 'empire' },
  { label: 'Kingdoms', value: 'kingdom' },
];

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
  readonly filters = FILTER_OPTIONS;
  readonly activeFilter = signal<SearchFilter>('all');
  readonly results = signal<SearchResult[]>([]);
  readonly filteredResults = computed(() => this.results().filter((result) => this.matchesFilter(result)));
  readonly loading = signal(true);
  readonly searched = signal(false);

  async ngOnInit(): Promise<void> {
    // Ensure the article index (and any future async data) is ready before first search
    await this.articles.whenReady();
    this.loading.set(false);

    this.query = this.route.snapshot.queryParamMap.get('q') ?? '';
    this.activeFilter.set(this.toFilter(this.route.snapshot.queryParamMap.get('type')));
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
        const filterFromUrl = this.toFilter(params.get('type'));
        if (filterFromUrl !== this.activeFilter()) {
          this.activeFilter.set(filterFromUrl);
        }
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

  setFilter(filter: SearchFilter): void {
    this.activeFilter.set(filter);
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
      queryParams: {
        q: this.query.trim() || null,
        type: this.activeFilter() === 'all' ? null : this.activeFilter(),
      },
      replaceUrl: true,
    });
  }

  private toFilter(value: string | null): SearchFilter {
    return FILTER_OPTIONS.some((option) => option.value === value) ? (value as SearchFilter) : 'all';
  }

  private matchesFilter(result: SearchResult): boolean {
    const filter = this.activeFilter();
    if (filter === 'all') return true;
    if (filter === 'empire') return result.kind === 'polity' && result.kindLabel === 'Empire';
    if (filter === 'kingdom') return result.kind === 'polity' && result.kindLabel === 'Regional Kingdom';
    return result.kind === filter;
  }
}
