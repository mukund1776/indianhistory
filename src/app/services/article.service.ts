import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Article, SearchEntry } from '../models/article.model';
import { LocaleService } from '../i18n/locale.service';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly http = inject(HttpClient);
  private readonly locale = inject(LocaleService);
  private readonly articles = signal<Article[]>([]);
  private readonly searchIndex = signal<SearchEntry[]>([]);
  private ready: Promise<void>;

  readonly allArticles = this.articles.asReadonly();

  constructor() {
    this.ready = this.load();
  }

  async whenReady(): Promise<void> {
    await this.ready;
  }

  getBySlug(slug: string): Article | undefined {
    return this.articles().find((a) => a.slug === slug);
  }

  hasWorldHistoryStories(): boolean {
    const worldHistoryTags = new Set(['world history', this.locale.navigation.worldHistory.toLocaleLowerCase(this.locale.language)]);
    return this.articles().some(article =>
      article.period === 'world-history' ||
      article.themes?.includes('world-history') ||
      article.tags?.some(tag => worldHistoryTags.has(tag.toLocaleLowerCase(this.locale.language)))
    );
  }

  search(query: string): SearchEntry[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return this.searchIndex().filter((entry) => {
      const haystack = `${entry.title} ${entry.excerpt} ${entry.text}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  private async load(): Promise<void> {
    const base = this.locale.language === 'en' ? '/assets/generated' : `/assets/generated/${this.locale.language}`;
    let articles: Article[];
    let index: SearchEntry[];
    try {
      [articles, index] = await Promise.all([
        firstValueFrom(this.http.get<Article[]>(`${base}/articles.json`)),
        firstValueFrom(this.http.get<SearchEntry[]>(`${base}/search-index.json`)),
      ]);
    } catch (error) {
      if (this.locale.language === 'en') throw error;
      this.locale.translationAvailable.set(false);
      [articles, index] = await Promise.all([
        firstValueFrom(this.http.get<Article[]>('/assets/generated/articles.json')),
        firstValueFrom(this.http.get<SearchEntry[]>('/assets/generated/search-index.json')),
      ]);
    }
    this.articles.set(articles);
    this.searchIndex.set(index);
  }
}
