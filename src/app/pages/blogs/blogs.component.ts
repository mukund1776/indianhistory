import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-blogs',
  imports: [DatePipe, RouterLink],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css',
})
export class BlogsComponent implements OnInit {
  private readonly articlesService = inject(ArticleService);
  readonly articles = signal<Article[]>([]);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.articlesService.whenReady();
    this.articles.set(
      [...this.articlesService.allArticles()].sort(
        (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
      )
    );
    this.loading.set(false);
  }
}
