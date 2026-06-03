import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { PeriodsService } from '../../services/periods.service';
import { Period, Polity, PolityKind } from '../../data/periods';

interface TimelinePeriod {
  slug: string;
  name: string;
  range: string;
  description: string;
  articleCount: number;
}

interface PolityDisplay {
  slug: string;
  name: string;
  range: string;
  description: string;
  articleCount: number;
  period: string;
  kind: PolityKind;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly articlesSvc = inject(ArticleService);
  private readonly periodsSvc = inject(PeriodsService);

  readonly list = signal<Article[]>([]);
  readonly loading = signal(true);
  readonly timelinePeriods = signal<TimelinePeriod[]>([]);
  readonly empires = signal<PolityDisplay[]>([]);
  readonly regionalKingdoms = signal<PolityDisplay[]>([]);

  async ngOnInit(): Promise<void> {
    await this.articlesSvc.whenReady();

    // Visual "Long Arc" on home: the broad top-level periods only.
    // Sub-periods (e.g. Mauryan, Mughal) appear when you drill into their parent period.
    // Counts include articles in sub-periods.
    const displaySlugs = ['prehistory', 'indus-valley', 'early-historic', 'classical', 'medieval', 'colonial', 'modern'];
    const withCounts: TimelinePeriod[] = [];

    for (const slug of displaySlugs) {
      const p = this.periodsSvc.getBySlug(slug);
      if (!p) continue;
      const count = await this.periodsSvc.getArticleCount(slug);
      withCounts.push({
        slug: p.slug,
        name: p.name,
        range: p.range,
        description: p.shortDescription,
        articleCount: count,
      });
    }

    this.timelinePeriods.set(withCounts);

    // Load empires and regional kingdoms separately for two distinct deep-dive sections.
    // Each article can still appear under a broad period (via `period`) *and* under its specific polity (via `polity` frontmatter).
    const empirePolities = this.periodsSvc.getEmpires();
    const rkPolities = this.periodsSvc.getRegionalKingdoms();

    const empireDisplays: PolityDisplay[] = [];
    for (const p of empirePolities) {
      const count = await this.periodsSvc.getArticleCountForPolity(p.slug);
      empireDisplays.push({
        slug: p.slug,
        name: p.name,
        range: p.range,
        description: p.shortDescription,
        articleCount: count,
        period: p.period,
        kind: p.kind,
      });
    }
    this.empires.set(empireDisplays);

    const rkDisplays: PolityDisplay[] = [];
    for (const p of rkPolities) {
      const count = await this.periodsSvc.getArticleCountForPolity(p.slug);
      rkDisplays.push({
        slug: p.slug,
        name: p.name,
        range: p.range,
        description: p.shortDescription,
        articleCount: count,
        period: p.period,
        kind: p.kind,
      });
    }
    this.regionalKingdoms.set(rkDisplays);

    this.list.set(this.articlesSvc.allArticles());
    this.loading.set(false);
  }
}