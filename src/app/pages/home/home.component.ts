import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly articles = inject(ArticleService);
  readonly list = signal<Article[]>([]);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.articles.whenReady();
    this.list.set(this.articles.allArticles());
    this.loading.set(false);
  }
}