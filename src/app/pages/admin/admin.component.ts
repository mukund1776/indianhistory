import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostStoreService } from '../../services/post-store.service';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, DatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  private readonly store = inject(PostStoreService);
  private readonly router = inject(Router);
  readonly posts = signal<Post[]>([]);
  readonly loading = signal(true);
  readonly message = signal('');
  readonly error = signal('');

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    await this.store.whenReady();
    this.posts.set(this.store.allPosts());
    this.loading.set(false);
  }

  exportPosts(): void {
    this.store.exportToFile();
    this.message.set('Downloaded posts.json — replace public/data/posts.json before building.');
    this.error.set('');
  }

  async onImport(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    try {
      await this.store.importFromFile(file);
      await this.refresh();
      this.message.set(`Imported ${this.posts().length} posts.`);
      this.error.set('');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Import failed.');
      this.message.set('');
    }
    input.value = '';
  }

  async deletePost(post: Post): Promise<void> {
    if (!confirm(`Delete "${post.title}"?`)) {
      return;
    }
    await this.store.delete(post.id);
    await this.refresh();
    this.message.set('Post deleted.');
    this.error.set('');
  }

  resetToSeed(): void {
    if (!confirm('Clear saved posts and reload from public/data/posts.json?')) {
      return;
    }
    localStorage.removeItem('indian-history-posts');
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      window.location.reload();
    });
  }
}