import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostStoreService } from '../../services/post-store.service';

@Component({
  selector: 'app-post-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css',
})
export class PostDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PostStoreService);
  readonly post = signal<Post | null>(null);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.store.whenReady();
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.post.set(this.store.getBySlug(slug) ?? null);
    this.loading.set(false);
  }

  paragraphs(content: string): string[] {
    return content.split(/\n\n+/).filter((p) => p.trim());
  }
}