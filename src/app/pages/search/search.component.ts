import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SearchEntry } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  private readonly articles = inject(ArticleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  query = '';
  readonly results = signal<SearchEntry[]>([]);
  readonly loading = signal(true);
  readonly searched = signal(false);

  async ngOnInit(): Promise<void> {
    await this.articles.whenReady();
    this.loading.set(false);
    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('q') ?? '';
      this.runSearch();
    });
  }

  submit(): void {
    void this.router.navigate(['/search'], {
      queryParams: { q: this.query.trim() || null },
    });
  }

  private runSearch(): void {
    this.searched.set(this.query.trim().length > 0);
    this.results.set(this.articles.search(this.query));
  }
}