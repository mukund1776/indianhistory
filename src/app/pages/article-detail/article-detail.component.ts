import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { PeriodsService } from '../../services/periods.service';

@Component({
  selector: 'app-article-detail',
  imports: [RouterLink, DatePipe],
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
  readonly loading = signal(true);
  readonly backLink = signal<string>('/');
  readonly backText = signal<string>('← All stories');

  async ngOnInit(): Promise<void> {
    await this.articles.whenReady();
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const found = this.articles.getBySlug(slug) ?? null;
    this.article.set(found);
    this.html.set(
      found ? this.sanitizer.bypassSecurityTrustHtml(found.html) : null
    );

    // Context-aware back navigation
    const fromPeriodSlug = this.route.snapshot.queryParamMap.get('fromPeriod');
    const fromPolitySlug = this.route.snapshot.queryParamMap.get('fromPolity');
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
}