import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-article-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.css',
})
export class ArticleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly articles = inject(ArticleService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly article = signal<Article | null>(null);
  readonly html = signal<SafeHtml | null>(null);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.articles.whenReady();
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const found = this.articles.getBySlug(slug) ?? null;
    this.article.set(found);
    this.html.set(
      found ? this.sanitizer.bypassSecurityTrustHtml(found.html) : null
    );
    this.loading.set(false);
  }
}