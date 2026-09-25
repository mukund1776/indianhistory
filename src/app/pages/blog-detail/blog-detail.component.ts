import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BlogPost } from '../../models/blog.model';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css',
})
export class BlogDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly blogs = inject(BlogService);
  private readonly sanitizer = inject(DomSanitizer);
  private requestId = 0;

  readonly post = signal<BlogPost | null>(null);
  readonly html = signal<SafeHtml | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async params => {
      const requestId = ++this.requestId;
      this.loading.set(true);
      await this.blogs.whenReady();
      if (requestId !== this.requestId) return;
      const post = this.blogs.getBySlug(params.get('slug') ?? '') ?? null;
      this.post.set(post);
      this.html.set(post ? this.sanitizer.bypassSecurityTrustHtml(post.html) : null);
      this.loading.set(false);
    });
  }
}
