import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BlogPost } from '../models/blog.model';
import { LocaleService } from '../i18n/locale.service';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly locale = inject(LocaleService);
  private readonly posts = signal<BlogPost[]>([]);
  private readonly ready = this.load();

  readonly allPosts = this.posts.asReadonly();

  async whenReady(): Promise<void> {
    await this.ready;
  }

  getBySlug(slug: string): BlogPost | undefined {
    return this.posts().find(post => post.slug === slug);
  }

  private async load(): Promise<void> {
    const base = this.locale.language === 'en' ? this.locale.generatedAssetsBase : `${this.locale.generatedAssetsBase}${this.locale.language}/`;
    try {
      this.posts.set(await firstValueFrom(this.http.get<BlogPost[]>(`${base}blogs.json`)));
    } catch (error) {
      if (this.locale.language === 'en') throw error;
      this.locale.translationAvailable.set(false);
      this.posts.set(await firstValueFrom(this.http.get<BlogPost[]>(`${this.locale.generatedAssetsBase}blogs.json`)));
    }
  }
}
