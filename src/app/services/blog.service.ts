import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BlogPost } from '../models/blog.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);
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
    this.posts.set(await firstValueFrom(this.http.get<BlogPost[]>('/assets/generated/blogs.json')));
  }
}
