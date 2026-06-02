import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Post } from '../models/post.model';

const STORAGE_KEY = 'indian-history-posts';
const SEED_URL = '/data/posts.json';

@Injectable({ providedIn: 'root' })
export class PostStoreService {
  private readonly http = inject(HttpClient);
  private readonly posts = signal<Post[]>([]);
  private ready: Promise<void>;

  readonly allPosts = this.posts.asReadonly();

  constructor() {
    this.ready = this.bootstrap();
  }

  async whenReady(): Promise<void> {
    await this.ready;
  }

  getBySlug(slug: string): Post | undefined {
    return this.posts().find((p) => p.slug === slug);
  }

  getById(id: string): Post | undefined {
    return this.posts().find((p) => p.id === id);
  }

  async save(post: Post): Promise<void> {
    await this.whenReady();
    const list = [...this.posts()];
    const index = list.findIndex((p) => p.id === post.id);
    if (index >= 0) {
      list[index] = post;
    } else {
      list.unshift(post);
    }
    this.persist(list);
  }

  async delete(id: string): Promise<void> {
    await this.whenReady();
    this.persist(this.posts().filter((p) => p.id !== id));
  }

  exportToFile(): void {
    const blob = new Blob([JSON.stringify(this.posts(), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'posts.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async importFromFile(file: File): Promise<void> {
    const text = await file.text();
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid file: expected a JSON array of posts.');
    }
    this.persist(parsed as Post[]);
    this.ready = Promise.resolve();
  }

  slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  uniqueSlug(base: string, excludeId?: string): string {
    let slug = base || 'untitled';
    let counter = 1;
    while (this.posts().some((p) => p.slug === slug && p.id !== excludeId)) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }

  newId(): string {
    return crypto.randomUUID();
  }

  private async bootstrap(): Promise<void> {
    const stored = this.readStorage();
    if (stored) {
      this.posts.set(this.sortPosts(stored));
      return;
    }
    try {
      const seed = await firstValueFrom(this.http.get<Post[]>(SEED_URL));
      this.persist(this.sortPosts(seed));
    } catch {
      this.posts.set([]);
    }
  }

  private persist(list: Post[]): void {
    const sorted = this.sortPosts(list);
    this.posts.set(sorted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  }

  private readStorage(): Post[] | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as Post[];
    } catch {
      return null;
    }
  }

  private sortPosts(list: Post[]): Post[] {
    return [...list].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }
}