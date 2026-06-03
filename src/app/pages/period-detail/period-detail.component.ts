import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { PeriodsService } from '../../services/periods.service';
import { Period, Polity } from '../../data/periods';

@Component({
  selector: 'app-period-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './period-detail.component.html',
  styleUrl: './period-detail.component.css',
})
export class PeriodDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly periodsService = inject(PeriodsService);
  private readonly articlesService = inject(ArticleService);
  private readonly destroyRef = inject(DestroyRef);

  readonly period = signal<Period | null>(null);
  readonly polity = signal<Polity | null>(null);
  readonly parent = signal<Period | null>(null);
  readonly children = signal<Period[]>([]);
  readonly articles = signal<Article[]>([]);
  readonly childCounts = signal<Record<string, number>>({});
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly isPolity = signal(false);

  readonly backRoute = signal<any>(['/']);
  readonly backFragment = signal<string | undefined>(undefined);
  readonly backText = signal<string>('← Back to home');

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(async (params) => {
      const slug = params.get('slug') ?? '';
      await this.loadPeriod(slug);
    });
  }

  private async loadPeriod(slug: string): Promise<void> {
    this.loading.set(true);
    this.notFound.set(false);
    this.isPolity.set(false);
    this.period.set(null);
    this.polity.set(null);

    await this.articlesService.whenReady();

    // Check if we arrived here directly from the search page
    const fromSearch = !!this.route.snapshot.queryParamMap.get('fromSearch');

    // Try as broad period first
    let p = this.periodsService.getBySlug(slug);
    if (p) {
      this.period.set(p);
      this.children.set(p.children ?? []);
      this.isPolity.set(false);

      const arts = await this.periodsService.getArticlesForPeriod(slug);
      this.articles.set(arts);

      const counts: Record<string, number> = {};
      for (const child of p.children ?? []) {
        counts[child.slug] = await this.periodsService.getArticleCount(child.slug);
      }
      this.childCounts.set(counts);

      const parentPeriod = this.periodsService.getParent(slug);
      if (parentPeriod) {
        this.backRoute.set(['/period', parentPeriod.slug]);
        this.backFragment.set(undefined);
        this.backText.set(`← Back to ${parentPeriod.name}`);
      } else {
        this.backRoute.set(['/']);
        this.backFragment.set(undefined);
        this.backText.set('← Back to home');
      }
    } else {
      // Try as specific polity / empire / kingdom
      const pol = this.periodsService.getPolityBySlug(slug);
      if (pol) {
        this.polity.set(pol);
        this.isPolity.set(true);
        this.children.set([]); // polities are leaves for now

        const arts = await this.periodsService.getArticlesForPolity(slug);
        this.articles.set(arts);
        this.childCounts.set({});

        // Context-aware up-navigation: back to the correct section on the home page
        // (not a broad period view, and not always the old combined "Empires & Regional Kingdoms").
        if (pol.kind === 'empire') {
          this.backRoute.set(['/']);
          this.backFragment.set('empires');
          this.backText.set('← Back to Empires');
        } else {
          this.backRoute.set(['/']);
          this.backFragment.set('regional-kingdoms');
          this.backText.set('← Back to Regional Kingdoms');
        }
      } else {
        this.notFound.set(true);
      }
    }

    // If the user came via search, prefer "back to search" over the normal hierarchy back
    if (fromSearch) {
      this.backRoute.set(['/search']);
      this.backFragment.set(undefined);
      this.backText.set('← Back to search');
    }

    this.loading.set(false);
  }
}
